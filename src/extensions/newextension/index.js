const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const TargetType = require("../../extension-support/target-type");
const Cast = require("../../util/cast");
const log = require("../../util/log");
const Runtime = require("../../engine/runtime");
const formatMessage = require("format-message");

class CoolThing {
    static instance = 0;

    constructor() {
        this.i = CoolThing.instance++;
        console.log("new cool thing ", this.i);
    }

    doIt(a) {
        console.log("did it", this.i, "a", a);
    }
}

class NewExtension {
    /**
     *
     * @param {Runtime} runtime
     */
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            // Required: the machine-readable name of this extension.
            // Will be used as the extension's namespace.
            // Allowed characters are those matching the regular expression [\w-]: A-Z, a-z, 0-9, and hyphen ("-").
            id: "newextension",

            // Core extensions only: override the default extension block colors.
            // color1: '#FF8C1A',
            // color2: '#DB6E00',

            // Optional: the human-readable name of this extension as string.
            // This and any other string to be displayed in the Scratch UI may either be
            // a string or a call to `formatMessage`; a plain string will not be
            // translated whereas a call to `formatMessage` will connect the string
            // to the translation map (see below). The `formatMessage` call is
            // similar to `formatMessage` from `react-intl` in form, but will actually
            // call some extension support code to do its magic. For example, we will
            // internally namespace the messages such that two extensions could have
            // messages with the same ID without colliding.
            // See also: https://github.com/yahoo/react-intl/wiki/API#formatmessage
            name: formatMessage({
                id: "extensionName",
                defaultMessage: "New Extension",
                description: 'The name of the "Some Blocks" extension',
            }),

            // Optional: URI for a block icon, to display at the edge of each block for this
            // extension. Data URI OK.
            // TODO: what file types are OK? All web images? Just PNG?
            blockIconURI:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==",

            // Optional: URI for an icon to be displayed in the blocks category menu.
            // If not present, the menu will display the block icon, if one is present.
            // Otherwise, the category menu shows its default filled circle.
            // Data URI OK.
            // TODO: what file types are OK? All web images? Just PNG?
            menuIconURI:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAAAAACyOJm3AAAAFklEQVQYV2P4DwMMEMgAI/+DEUIMBgAEWB7i7uidhAAAAABJRU5ErkJggg==",

            // Optional: Link to documentation content for this extension.
            // If not present, offer no link.
            docsURI: "https://....",

            blocks: [
                {
                    // Required: the machine-readable name of this operation.
                    // This will appear in project JSON.
                    opcode: "debug", // becomes 'newextension.debug'

                    // Required: the kind of block we're defining, from a predefined list.
                    // Fully supported block types:
                    //   BlockType.BOOLEAN - same as REPORTER but returns a Boolean value
                    //   BlockType.COMMAND - a normal command block, like "move {} steps"
                    //   BlockType.HAT - starts a stack if its value changes from falsy to truthy ("edge triggered")
                    //   BlockType.REPORTER - returns a value, like "direction"
                    // Block types in development or for internal use only:
                    //   BlockType.BUTTON - place a button in the block palette
                    //   BlockType.CONDITIONAL - control flow, like "if {}" or "if {} else {}"
                    //     A CONDITIONAL block may return the one-based index of a branch to
                    //     run, or it may return zero/falsy to run no branch.
                    //   BlockType.EVENT - starts a stack in response to an event (full spec TBD)
                    //   BlockType.LOOP - control flow, like "repeat {} {}" or "forever {}"
                    //     A LOOP block is like a CONDITIONAL block with two differences:
                    //     - the block is assumed to have exactly one child branch, and
                    //     - each time a child branch finishes, the loop block is called again.
                    blockType: BlockType.COMMAND,

                    // Required for CONDITIONAL blocks, ignored for others: the number of
                    // child branches this block controls. An "if" or "repeat" block would
                    // specify a branch count of 1; an "if-else" block would specify a
                    // branch count of 2.
                    // TODO: should we support dynamic branch count for "switch"-likes?
                    // branchCount: 0,

                    // Optional, default false: whether or not this block ends a stack.
                    // The "forever" and "stop all" blocks would specify true here.
                    terminal: true,

                    // Optional, default false: whether or not to block all threads while
                    // this block is busy. This is for things like the "touching color"
                    // block in compatibility mode, and is only needed if the VM runs in a
                    // worker. We might even consider omitting it from extension docs...
                    blockAllThreads: false,

                    // Required: the human-readable text on this block, including argument
                    // placeholders. Argument placeholders should be in [MACRO_CASE] and
                    // must be [ENCLOSED_WITHIN_SQUARE_BRACKETS].
                    text: "debug [a]",

                    // Required: describe each argument.
                    // Argument order may change during translation, so arguments are
                    // identified by their placeholder name. In those situations where
                    // arguments must be ordered or assigned an ordinal, such as interaction
                    // with Scratch Blocks, arguments are ordered as they are in the default
                    // translation (probably English).
                    arguments: {
                        a: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                    },

                    // Optional: the function implementing this block.
                    // If absent, assume `func` is the same as `opcode`.
                    func: "myReporter",

                    // Optional: list of target types for which this block should appear.
                    // If absent, assume it applies to all builtin targets -- that is:
                    // [TargetType.SPRITE, TargetType.STAGE]
                    filter: [TargetType.SPRITE],
                },
                {
                    opcode: "doit",
                    blockType: BlockType.COMMAND,
                    text: ["do it [a]"]
                },
                {
                    opcode: "hat",
                    blockType: BlockType.HAT,
                    text: "hat [a]",
                },
                {
                    opcode: "matrix",
                    blockType: BlockType.REPORTER,
                    text: "reporter - matrix [a] [FOO]",
                    arguments: {
                        a: {
                            type: ArgumentType.MATRIX,
                        },
                        FOO: {
                            type: ArgumentType.STRING,
                            menu: "menuA",
                        },
                        BAR: {
                            type: ArgumentType.NUMBER,
                        },
                    },
                },
                {
                    opcode: "newclass",
                    blockType: BlockType.REPORTER,
                    text: "newclass [a]",
                },
                {
                    opcode: "ternary",
                    blockType: BlockType.REPORTER,
                    text: "reporter - ternary [a] ? [b] : [c]",
                    arguments: {
                        a: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                        b: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                        c: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                    },
                },
                {
                    opcode: "conditional",
                    blockType: BlockType.CONDITIONAL,
                    branchCount: 4,
                    text: ["conditional [a] [b]", "conditional [c] [d]"],
                    arguments: {
                        a: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                        b: {
                            type: ArgumentType.STRING,
                            // defaultValue: "hello",
                        },
                    },
                },
            ],

            // Optional: define extension-specific menus here
            menus: {
                // Required: an identifier for this menu, unique within this extension.
                menuA: [
                    // Static menu: list items which should appear in the menu.
                    {
                        // Required: the value of the menu item when it is chosen.
                        value: "itemId1",

                        // Optional: the human-readable label for this item.
                        // Use `value` as the text if this is absent.
                        text: "item 1",
                    },

                    // The simplest form of a list item is a string which will be used as
                    // both value and text.
                    "itemId2",
                ],

                // Dynamic menu: returns an array as above.
                // Called each time the menu is opened.
                menuB: "getItemsForMenuB",

                // The examples above are shorthand for setting only the `items` property in this full form:
                menuC: {
                    // This flag makes a "droppable" menu: the menu will allow dropping a reporter in for the input.
                    acceptReporters: true,

                    // The `item` property may be an array or function name as in previous menu examples.
                    items:
                        [
                            /*...*/
                        ] || "getItemsForMenuC",
                },
            },
        };
    }

    /**
     * Implement myReporter.
     * @param {object} args - the block's arguments.
     * @property {string} MY_ARG - the string value of the argument.
     * @returns {string} a string which includes the block argument value.
     */
    myReporter(args) {
        console.log("myReporter", args);
        return "123";
    }

    /**
     *
     * @param {*} args
     * @param {*} info
     * @param {*} block
     */
    conditional(args, info, block) {
        console.log("conditional args!");
        console.dir(args);

        // console.log("conditional info!");
        // console.dir(info);

        // console.log("conditional block!");
        // console.dir(block);
        return "2";
    }

    doit(args){
        return args.a.doIt(123);
    }

    /**
     *
     * @param {*} args
     * @param {*} info
     * @param {*} block
     * @return
     */
    debug(args, info, block) {
        // console.log("debug args!");
        console.log("DEBUG", args);
    }

    hat(args, info, block) {
        console.log("hat args!");
        console.dir(args);
    }

    /**
     *
     * @param {*} args
     * @param {*} info
     * @param {*} block
     * @returns
     */
    matrix(args, info, block) {
        console.log("matrix args!", args);
        // console.dir(args);

        return args.a;
    }

    newclass(args, info, block) {
        console.log("newclass args!");
        console.dir(args);

        const r = new CoolThing();
        return r;
    }

    /**
     *
     * @param {*} args
     * @param {*} info
     * @param {*} block
     * @returns
     */
    ternary(args, info, block) {
        // console.log("reporter args!");
        // console.dir(args);

        return args.a ? args.b : args.c;
    }
}

module.exports = NewExtension;
