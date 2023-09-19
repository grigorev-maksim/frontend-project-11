import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import i18n from 'i18next';
import ru from './locales/ru.js';
import watcher from './View.js';

export default () => {
  const i18nInst = i18n.createInstance();
  i18nInst.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  })
    .then(() => {
      const elements = {
        lead: document.querySelector('.lead'),
        form: document.querySelector('form'),
        input: document.getElementById('url-input'),
        h1: document.querySelector('.display-3'),
        exampleP: document.querySelector('.mt-2'),
        btn: document.querySelector('button[type="submit"]'),
        feedback: document.querySelector('.feedback'),
      };

      elements.lead.textContent = i18nInst.t('keyLead');
      elements.h1.textContent = i18nInst.t('keyHeader');
      elements.exampleP.textContent = i18nInst.t('keyExample');
      elements.btn.textContent = i18nInst.t('keyBtn');

      const state = {
        form: {
          status: 'filling',
        },
        data: {
          feeds: [],
        },
      };

      const validate = (validlinks, inputvalue) => {
        const schema = yup.object({
          feedUrl: yup.string().url('Некорректный адрес')
            .notOneOf(
              validlinks,
              i18nInst.t('errTexts.errFeed'),
            )
            .required('Введите адрес'),
        });
        return schema.validate({ feedUrl: inputvalue });
      };

      const watchedState = watcher(state, elements, i18nInst);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputValue = e.target[0].value;

        const validLinks = watchedState.data.feeds.map((feed) => feed.link);

        validate(validLinks, inputValue)
          .then(() => {
            elements.form.reset();
            elements.input.focus();
          })
          .catch((err) => {
            console.log('Ошибка валидации');
            watchedState.form.status = 'invalid';

            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
