CXX ?= g++
CXXFLAGS ?= -std=c++17 -O2 -Wall -Wextra
WORKSPACE ?= workspace
BUILD_DIR ?= $(WORKSPACE)/.build
TEMPLATE ?= templates/base.cpp

CPP_FILES := $(shell rg --files -g '*.cpp')
MARKDOWN_FILES := $(shell rg --files notes -g '*.md')

ARGS := $(filter-out init run format lint notes-check notes-format notes-format-check,$(MAKECMDGOALS))
TASK := $(firstword $(ARGS))
SRC := $(if $(findstring /,$(TASK)),$(if $(filter %.cpp,$(TASK)),$(TASK),$(TASK).cpp),$(if $(filter %.cpp,$(TASK)),$(TASK),$(WORKSPACE)/$(TASK).cpp))
WORKSPACE_SRC := $(WORKSPACE)/$(TASK).cpp
WORKSPACE_STEM := $(WORKSPACE)/$(TASK)
STEM := $(basename $(SRC))
BIN := $(BUILD_DIR)/$(notdir $(STEM))

.PHONY: init run format lint notes-check notes-format notes-format-check $(ARGS)

lint:
	@clang-format --dry-run --Werror $(CPP_FILES)
	@python tools/notes/format_cpp_blocks.py --check $(MARKDOWN_FILES)

notes-check:
	python tools/notes/check_catalog.py

notes-format:
	python tools/notes/format_cpp_blocks.py --write $$(rg --files -g '*.md')

notes-format-check:
	python tools/notes/format_cpp_blocks.py --check $$(rg --files -g '*.md')

run:
	@test -n "$(TASK)" || (echo "usage: make run A" && exit 1)
	@test "$(TASK)" = "$(notdir $(TASK))" || (echo "run only supports workspace task names, e.g. make run A" && exit 1)
	@test -f "$(WORKSPACE_SRC)" || (echo "missing $(WORKSPACE_SRC)" && exit 1)
	@test -f "$(WORKSPACE_STEM).in" || (echo "missing $(WORKSPACE_STEM).in" && exit 1)
	@mkdir -p $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) "$(WORKSPACE_SRC)" -o "$(BUILD_DIR)/$(TASK)"
	"$(BUILD_DIR)/$(TASK)" < "$(WORKSPACE_STEM).in" > "$(WORKSPACE_STEM).out"

init:
	@test -n "$(TASK)" || (echo "usage: make init A" && exit 1)
	@test "$(TASK)" = "$(notdir $(TASK))" || (echo "init only supports workspace task names, e.g. make init A" && exit 1)
	@test -f "$(TEMPLATE)" || (echo "missing $(TEMPLATE)" && exit 1)
	@mkdir -p "$(WORKSPACE)"
	cp "$(TEMPLATE)" "$(WORKSPACE_SRC)"
	: > "$(WORKSPACE_STEM).in"
	: > "$(WORKSPACE_STEM).out"

format:
	@test -n "$(TASK)" || (echo "usage: make format A" && exit 1)
	@test -f "$(SRC)" || (echo "missing $(SRC)" && exit 1)
	clang-format -i "$(SRC)"

$(ARGS):
	@true
