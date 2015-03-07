SRC=$(shell find lib -name "*.coffee")
TARGETS=$(patsubst %.coffee,build/%.js,$(SRC))

all: clean prepublish

prepublish: $(TARGETS)

build/%.js: %.coffee
	@mkdir -p $(@D)
	@coffee -p -b $< >$@

clean:
	@rm -fr build
