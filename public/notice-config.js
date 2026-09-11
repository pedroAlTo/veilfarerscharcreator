// Switch this to true when the Nine Signals survey is ready to launch.
// Set the opening date separately in mini-campaign.mjs before enabling voting.
window.VF_MINI_SURVEY_ENABLED = false;
if (window.VF_MINI_SURVEY_ENABLED) {
  const template = document.querySelector('#vf-mini-survey-template');
  const placeholder = document.querySelector('#mini-invitation');
  if (template && placeholder) placeholder.replaceWith(template.content.cloneNode(true));
}
