import onChange from 'on-change';

export default (state, elements, i18n) => {
  const watcher = onChange(state, (path, value) => {
    switch (path) {
      case 'form.status':
        if (value === 'invalid') {
          elements.input.classList.add('is-invalid');
          elements.feedback.classList.remove('text-success');
          elements.feedback.classList.add('text-danger');
          elements.feedback.textContent = i18n.t('errTexts.errUrl');
        } else {
          elements.input.classList.remove('is-invalid');
        }
        break;
      default:
        break;
    }
  });
  return watcher;
};
