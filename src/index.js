import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';

const state = {
  validationState: 'valid',
  urls: [],
};

const input = document.querySelector('#url-input');
const form = document.querySelector('.rss-form');

const schema = yup
  .string()
  .required('Введите адрес')
  .notOneOf(state.urls, 'Адрес уже загружен')
  .url('Некорректный адрес');

const render = () => {
  if (state.validationState === 'invalid') {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }
};

const watchedState = onChange(state, render);

const validateForm = (url) => new Promise((resolve, reject) => {
  schema
    .validate(url)
    .then(() => {
      watchedState.validationState = 'valid';
      watchedState.urls.push(url);
      resolve();
    })
    .catch(() => {
      watchedState.validationState = 'invalid';
      reject();
    });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  validateForm(input.value)
    .then(() => {
      form.reset();
      input.focus();
    })
    .catch(() => {
      console.log('Ошибка валидации');
    });
});

export default watchedState;
