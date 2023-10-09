import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import watch from './render.js';
import ru from './locales/ru.js';
import uniqueId from './uniqueId.js';

const fetchRSS = (url) => {
  const newUrl = new URL('https://allorigins.hexlet.app');
  newUrl.pathname = 'get';
  newUrl.search = `disableCache=true&url=${url}`;

  return axios.get(newUrl);
};

const parseRSS = (contents) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(contents, 'text/xml');

  const rss = xml.querySelector('rss');
  if (!rss) {
    throw new Error('notIncludesRSS');
  }

  const titles = Array.from(xml.querySelectorAll('title')).map((item) => item.textContent);
  const descriptions = Array.from(xml.querySelectorAll('description')).map((item) => item.textContent);
  const links = Array.from(xml.querySelectorAll('link')).map((item) => item.textContent);

  const [, ...postLinks] = links;
  const [feedName, ...postsNames] = titles;
  const [feedDescription, ...postsDescriptions] = descriptions;

  const data = {};
  data.feed = {
    title: feedName,
    description: feedDescription,
  };

  data.posts = postsNames.map((title, index) => ({
    title,
    description: postsDescriptions[index],
    link: postLinks[index],
  }));

  return data;
};

const updatePosts = (state) => {
  const { feeds, posts } = state;
  const promises = feeds.map(({ link }) => fetchRSS(link)
    .then(({ data }) => {
      const updateData = parseRSS(data.contents);
      const currentTitles = posts.map((post) => post.title);
      const update = updateData.posts
        .filter((post) => !currentTitles.includes(post.title))
        .map((post) => ({ ...post, id: uniqueId() }));
      posts.unshift(...update);
    }));

  Promise.allSettled(promises).finally(() => setTimeout(updatePosts, 5000, state));
};

const app = () => {
  const stateApp = {
    feeds: [],
    posts: [],
    visitedLinks: new Set(),
    error: null,
    loading: false,
  };

  const elements = {
    statusBar: document.querySelector('.feedback'),
    form: document.querySelector('.rss-form'),
    formSubmitBtn: document.querySelector('.rss-form button'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      btn: document.querySelector('.modal-footer > .full-article'),
    },
  };

  const schema = (links) => yup
    .string()
    .required('notEmpty')
    .url('notValid')
    .notOneOf(links, 'alreadyExist');

  i18n.init({
    lng: 'ru',
    resources: {
      ru,
    },
  }).then((translate) => {
    const watchedState = watch(elements, stateApp, translate);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      watchedState.loading = true;

      const linksList = stateApp.feeds.map((feed) => feed.link);
      schema(linksList).validate(url)
        .then(() => fetchRSS(url))
        .then(({ data }) => {
          const { feed, posts } = parseRSS(data.contents);
          const postsWithId = posts.map((post) => ({ ...post, id: uniqueId() }));

          watchedState.error = null;
          watchedState.feeds.unshift({ ...feed, link: url });
          watchedState.posts.unshift(...postsWithId);
          watchedState.loading = false;
        })
        .catch((error) => {
          watchedState.loading = false;
          watchedState.error = error.message;
        });
    });

    elements.posts.addEventListener('click', ({ target }) => {
      if (target.tagName === 'A' || target.tagName === 'BUTTON') {
        const { id } = target.dataset;
        watchedState.visitedLinks.add(id);
      }
    });

    updatePosts(watchedState);
  });
};

export default app;
