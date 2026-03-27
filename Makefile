include .env
export

printenv:
	@echo "REMOTE: $(REMOTE)"
	@echo "SSH_KEY: $(SSH_KEY)"

setup: install-dependencies

install-dependencies:
	npm ci

# local run
dev:
	npm run start
lint:
	npm run lint
tsc:
	npx tsc --noEmit
test:
	npm run test

check: lint tsc test

# build & deploy
release: build deploy

build:
	npm run build
deploy:
	rsync -e 'ssh -i $(SSH_KEY)' -avz ./dist/* $(REMOTE):/root/apps/melodynator

# server
remote:
	ssh -i $(SSH_KEY) $(REMOTE)
