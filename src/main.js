import { render } from 'preact';
import { html } from './htm.js';
import { App } from './components/App.js';
import { songTitle, songLyrics, songStyle } from './state.js';

if (typeof window !== 'undefined') {
  window.__testSetSong = (title, lyrics, style) => {
    songTitle.value = title; songLyrics.value = lyrics; songStyle.value = style;
  };
}

render(html`<${App} />`, document.getElementById('app'));
