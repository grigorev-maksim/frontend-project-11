develop:
	npx webpack serve

install:
	npm ci

build:
	NODE_ENV=production npx webpack --mode production

test:
	npm test

lint:
	npx eslint .