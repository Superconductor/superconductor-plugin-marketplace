.PHONY: test test-record

test:
	npm test --prefix plugins/gemini/scripts

test-record:
	rm -rf plugins/gemini/scripts/fixtures
	npm test --prefix plugins/gemini/scripts
