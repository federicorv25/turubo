import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import Ajv from 'ajv'

const root = new URL('../../', import.meta.url)
async function json(file) {
  return JSON.parse(await readFile(new URL(file, root), 'utf8'))
}
function verifyText(text, context) {
  assert(['en', 'es'].every(lang => typeof text?.[lang] === 'string' && text[lang].trim()), context)
}

const story = await json('content/story.json')
assert.equal(story.version, 1)
verifyText(story.title, 'Story title must be bilingual')
verifyText(story.disclosure, 'Story disclosure must be bilingual')
assert.equal(story.order[0], 'prologue')
assert.equal(story.order.at(-1), 'epilogue')
assert.equal(new Set(story.order).size, story.order.length)
assert.deepEqual([...story.order].sort(), Object.keys(story.scenes).sort())
const reached = new Set()
function traverse(id) {
  if (reached.has(id)) return
  reached.add(id)
  for (const choice of story.scenes[id].choices) traverse(choice.next)
}
for (const [id, scene] of Object.entries(story.scenes)) {
  assert(['earth', 'moon', 'mars'].includes(scene.world), id + ': invalid world')
  verifyText(scene.title, id + ': missing bilingual title')
  verifyText(scene.text, id + ': missing bilingual text')
  if (scene.poison) verifyText(scene.poison, id + ': missing bilingual poison text')
  assert(scene.choices.length >= 1 && scene.choices.length <= 3, id + ': use one to three choices')
  for (const choice of scene.choices) {
    verifyText(choice.label, id + ': missing bilingual button')
    if (choice.feedback) verifyText(choice.feedback, id + ': missing bilingual feedback')
    assert(Object.hasOwn(story.scenes, choice.next), id + ': invalid next scene')
    assert.equal(choice.next, story.order[(story.order.indexOf(id) + 1) % story.order.length], id + ': keep the linear ending')
  }
}
traverse(story.order[0])
assert.equal(reached.size, story.order.length, 'All scenes must be reachable')

const schema = await json('schema/analysis.schema.json')
const validate = new Ajv({ allErrors: true, strictRequired: false, strictTypes: false }).compile(schema)
for (const [file, simulated] of [['web/public/data/analysis.json', false], ['fixtures/analysis.example.json', true]]) {
  const data = await json(file)
  assert(validate(data), file + ': ' + JSON.stringify(validate.errors))
  assert.equal(data.simulated, simulated, file + ': explicitly distinguish real public data from fixtures')
  const terrains = new Map(data.terrains.map(item => [item.id, item]))
  assert.equal(terrains.size, data.terrains.length, file + ': duplicate IDs')
  for (const item of data.terrains) {
    assert(item.metrics.slopeP90Deg >= item.metrics.slopeMedianDeg, item.id + ': P90 slope is below median')
    if (!simulated) {
      assert(!new URL(item.source).hostname.endsWith('.invalid'), item.id + ': placeholder source')
      if (item.image) await access(new URL('web/public/' + item.image, root))
    }
  }
  for (const [world, item] of Object.entries(data.comparisons)) {
    if (item.status !== 'reviewed') continue
    assert.equal(terrains.get(item.referenceId)?.body, world, world + ': invalid reference')
    if (item.guidedId) assert.equal(terrains.get(item.guidedId)?.body, 'earth', world + ': invalid guided comparison')
    const unique = new Set()
    for (const [index, { id, distance }] of item.ranked.entries()) {
      assert.equal(terrains.get(id)?.body, 'earth', world + ': invalid candidate')
      assert(id !== item.guidedId && !unique.has(id), world + ': guided comparison or duplicate in ranking')
      assert(index === 0 || distance >= item.ranked[index - 1].distance, world + ': entries not ordered')
      unique.add(id)
    }
  }
}
console.log('Story EN/ES, transitions, terrain schema and public data checked.')
