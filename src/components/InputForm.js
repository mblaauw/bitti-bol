import { html } from '../htm.js';
import { computed } from 'https://esm.sh/@preact/signals@2.0.1?external=preact';
import { pipelineSteps, formTopic, formMood, formOccasion, formInstruments, formNotes, runPipeline } from '../state.js';
export function InputForm() {
  const isBusy = computed(() => pipelineSteps.value.some(s => s.status === 'active'));
  const handleGenerate = () => {
    const topic = formTopic.value.trim();
    if (!topic || isBusy.value) return;
    runPipeline({ topic, mood: formMood.value, occasion: formOccasion.value, instruments: formInstruments.value, notes: formNotes.value });
  };
  return html`<section class="card">
      <div class="card-header">
        <h2>New Song</h2>
        <span style="font-family:var(--mono);font-size:10px;color:var(--text-muted)">01</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:11px">
        <div>
          <label class="form-label">Topic <span style="color:var(--accent)">*</span></label>
          <textarea class="form-textarea" value=${formTopic} onInput=${e => formTopic.value = e.target.value} placeholder="chitte dandru · mountain love · apple harvest" style="min-height:54px"></textarea>
          <p class="form-hint">Type in any language — lyrics come back in Mahasuvi Pahari.</p>
        </div>
        <div>
          <label class="form-label">Mood</label>
          <input class="form-input" value=${formMood} onInput=${e => formMood.value = e.target.value} placeholder="romantic · longing · celebratory"/>
        </div>
        <div>
          <label class="form-label">Occasion</label>
          <input class="form-input" value=${formOccasion} onInput=${e => formOccasion.value = e.target.value} placeholder="wedding · festival · harvest"/>
        </div>
        <div>
          <label class="form-label">Instruments</label>
          <input class="form-input" value=${formInstruments} onInput=${e => formInstruments.value = e.target.value} placeholder="bansuri · dhol · chimta · acoustic guitar"/>
          <p class="form-hint-sm">Base: acoustic guitar, bansuri, dhol, chimta</p>
        </div>
        <div>
          <label class="form-label">Notes</label>
          <textarea class="form-textarea" value=${formNotes} onInput=${e => formNotes.value = e.target.value} placeholder="Any extra guidance\u2026" style="min-height:40px"></textarea>
        </div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:16px" onClick=${handleGenerate} disabled=${isBusy.value || !formTopic.value.trim()}>${isBusy.value ? 'Generating\u2026' : 'Generate song'}</button>
    </section>`;
}
