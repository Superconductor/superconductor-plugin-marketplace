.PHONY: test delete-fixtures

test:
	npm test --prefix plugins/gemini/scripts

delete-fixtures:
	rm -rf plugins/gemini/scripts/fixtures
