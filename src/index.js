import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';

const input = document.querySelector('#url-input');
const form = document.querySelector('.rss-form');

const urls = [];

const schema = yup.string().required().notOneOf(urls, 'alreadyLoaded').url('invalidUrl');

const validateForm = async (url) => {
  try {
    await schema.validate(url);
    input.classList.remove('is-invalid');
    urls.push(url);
  } catch (error) {
    input.classList.add('is-invalid');
  }
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await validateForm(input.value);
  form.reset();
  input.focus();
});
