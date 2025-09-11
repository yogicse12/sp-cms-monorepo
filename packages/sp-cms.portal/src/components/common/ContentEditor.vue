<template>
  <div v-if="editor" class="editor" :class="$attrs.class">
    <div class="tools">
      <button
        class="btn-tool"
        @click="editor.commands.setParagraph()"
        :class="{ 'is-active': editor.isActive('paragraph') }"
        :disabled="displayMode === 'VIEW'"
        title="Paragraph"
      >
        P
      </button>
      <div class="tool-divider"></div>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        :disabled="displayMode === 'VIEW'"
        title="Heading 1"
      >
        H1
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        :disabled="displayMode === 'VIEW'"
        title="Heading 2"
      >
        H2
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        :disabled="displayMode === 'VIEW'"
        title="Heading 3"
      >
        H3
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
        :disabled="displayMode === 'VIEW'"
        title="Heading 4"
      >
        H4
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
        :disabled="displayMode === 'VIEW'"
        title="Heading 5"
      >
        H5
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
        :disabled="displayMode === 'VIEW'"
        title="Heading 6"
      >
        H6
      </button>
      <div class="tool-divider"></div>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        :disabled="displayMode === 'VIEW'"
        title="Bold (Ctrl+B)"
      >
        <BoldIcon :size="18" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        :disabled="displayMode === 'VIEW'"
        title="Italic (Ctrl+I)"
      >
        <ItalicIcon :size="16" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'is-active': editor.isActive('underline') }"
        :disabled="displayMode === 'VIEW'"
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon :size="18" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
        :disabled="displayMode === 'VIEW'"
        title="Strikethrough"
      >
        <Strikethrough :size="18" />
      </button>
      <div class="tool-divider"></div>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        :disabled="displayMode === 'VIEW'"
        title="Bullet List"
      >
        <ListIcon :size="20" :stroke-width="1.5" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        :disabled="displayMode === 'VIEW'"
        title="Numbered List"
      >
        <ListOrdered :size="20" :stroke-width="1.5" />
      </button>
      <div class="tool-divider"></div>
      <button
        class="btn-tool"
        @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
        :disabled="displayMode === 'VIEW'"
        title="Align Left"
      >
        <AlignLeft :size="18" :stroke-width="1.5" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
        :disabled="displayMode === 'VIEW'"
        title="Align Center"
      >
        <AlignCenter :size="18" :stroke-width="1.5" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
        :disabled="displayMode === 'VIEW'"
        title="Align Right"
      >
        <AlignRight :size="18" :stroke-width="1.5" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().setTextAlign('justify').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }"
        :disabled="displayMode === 'VIEW'"
        title="Justify"
      >
        <AlignJustify :size="18" :stroke-width="1.5" />
      </button>
      <div class="tool-divider"></div>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleHighlight().run()"
        :class="{ 'is-active': editor.isActive('highlight') }"
        :disabled="displayMode === 'VIEW'"
        title="Highlight"
      >
        <PenLine :size="18" :stroke-width="1.5" />
      </button>
      <button
        class="btn-tool"
        @click="setLink"
        :class="{ 'is-active': editor.isActive('link') }"
        :disabled="displayMode === 'VIEW'"
        title="Insert/Edit Link"
      >
        <LinkIcon :size="18" :stroke-width="1.5" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().setHorizontalRule().run()"
        :disabled="displayMode === 'VIEW'"
        title="Insert Horizontal Rule"
      >
        <Minus :size="18" :stroke-width="1.5" />
      </button>
      <div class="tool-divider"></div>
      <button
        class="btn-tool"
        @click="editor.chain().focus().undo().run()"
        :disabled="displayMode === 'VIEW' || !editor.can().undo()"
        title="Undo (Ctrl+Z)"
      >
        <Undo :size="18" :stroke-width="1.5" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().redo().run()"
        :disabled="displayMode === 'VIEW' || !editor.can().redo()"
        title="Redo (Ctrl+Y)"
      >
        <Redo :size="18" :stroke-width="1.5" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().setHardBreak().run()"
        :disabled="displayMode === 'VIEW'"
        title="Insert Line Break (Shift+Enter)"
      >
        <WrapText :size="18" :stroke-width="1.5" />
      </button>
      <div class="tool-divider"></div>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleSuperscript().run()"
        :class="{ 'is-active': editor.isActive('superscript') }"
        :disabled="displayMode === 'VIEW'"
        title="Superscript"
      >
        <SuperscriptIcon :size="18" :stroke-width="1.5" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().toggleSubscript().run()"
        :class="{ 'is-active': editor.isActive('subscript') }"
        :disabled="displayMode === 'VIEW'"
        title="Subscript"
      >
        <SubscriptIcon :size="18" :stroke-width="1.5" />
      </button>
      <div class="tool-divider"></div>
      <button
        class="btn-tool"
        @click="editor.chain().focus().outdent().run()"
        :disabled="displayMode === 'VIEW'"
        title="Decrease Indent (Shift+Tab)"
      >
        <Outdent :size="18" :stroke-width="1.5" />
      </button>
      <button
        class="btn-tool"
        @click="editor.chain().focus().indent().run()"
        :disabled="displayMode === 'VIEW'"
        title="Increase Indent (Tab)"
      >
        <Indent :size="18" :stroke-width="1.5" />
      </button>
      <div class="tool-divider"></div>
      <div class="btn-dropdown" :disabled="displayMode === 'VIEW'">
        <button
          class="btn-tool"
          :class="{ 'is-active': editor.isActive('table') }"
        >
          <TableIcon :size="18" :stroke-width="1.5" />
        </button>
        <div class="btn-dropdown-content">
          <button @click="insertTable" :disabled="displayMode === 'VIEW'">
            Add Table (3x3)
          </button>
          <button
            @click="insertCustomTable(2, 2)"
            :disabled="displayMode === 'VIEW'"
          >
            Add Small Table (2x2)
          </button>
          <button
            @click="insertCustomTable(4, 4)"
            :disabled="displayMode === 'VIEW'"
          >
            Add Large Table (4x4)
          </button>

          <!-- Table operations (only show when in table) -->
          <template v-if="editor.isActive('table')">
            <div class="dropdown-divider"></div>
            <button
              @click="editor.chain().focus().addColumnBefore().run()"
              :disabled="displayMode === 'VIEW'"
            >
              Add Column Before
            </button>
            <button
              @click="editor.chain().focus().addColumnAfter().run()"
              :disabled="displayMode === 'VIEW'"
            >
              Add Column After
            </button>
            <button
              @click="editor.chain().focus().addRowBefore().run()"
              :disabled="displayMode === 'VIEW'"
            >
              Add Row Before
            </button>
            <button
              @click="editor.chain().focus().addRowAfter().run()"
              :disabled="displayMode === 'VIEW'"
            >
              Add Row After
            </button>
            <div class="dropdown-divider"></div>
            <button
              @click="editor.chain().focus().deleteColumn().run()"
              :disabled="displayMode === 'VIEW'"
              class="text-red-600"
            >
              Delete Column
            </button>
            <button
              @click="editor.chain().focus().deleteRow().run()"
              :disabled="displayMode === 'VIEW'"
              class="text-red-600"
            >
              Delete Row
            </button>
            <button
              @click="editor.chain().focus().deleteTable().run()"
              :disabled="displayMode === 'VIEW'"
              class="text-red-600"
            >
              Delete Table
            </button>
          </template>
        </div>
      </div>
    </div>
    <div class="editor-content-wrapper">
      <EditorContent :editor="editor" :disabled="displayMode === 'VIEW'" />
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, onBeforeUnmount } from 'vue';

defineOptions({
  inheritAttrs: false,
});
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  Strikethrough,
  ListIcon,
  ListOrdered,
  PenLine,
  LinkIcon,
  Minus,
  Undo,
  Redo,
  WrapText,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  Outdent,
  Indent,
  Table as TableIcon,
} from 'lucide-vue-next';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { Indent as IndentExtension } from '@/components/common/extensions/Indent.js';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  displayMode: {
    type: String,
    default: 'VIEW',
  },
});
const emit = defineEmits(['update:modelValue']);
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      // Disable unused extensions to reduce bundle size
      blockquote: false,
      codeBlock: false,
      code: false,
      dropcursor: false,
      gapcursor: false,
      // Configure used extensions
      bold: {
        HTMLAttributes: {
          class: 'font-bold',
        },
      },
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      history: {
        depth: 100,
        newGroupDelay: 500,
      },
    }),
    // Additional extensions not in StarterKit
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Underline,
    Highlight,
    Link,
    Superscript,
    Subscript,
    IndentExtension.configure({
      types: ['paragraph', 'heading', 'listItem'],
      minIndent: 0,
      maxIndent: 8,
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'tiptap-table',
        style:
          'border-collapse: collapse; border: 2px solid #333; width: 100%;',
      },
    }),
    TableRow.configure({
      HTMLAttributes: {
        style: 'border: 1px solid #333;',
      },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        style:
          'border: 1px solid #333; background-color: #f8f9fa; font-weight: bold; padding: 8px 12px;',
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        style: 'border: 1px solid #333; padding: 8px 12px;',
      },
    }),
  ],

  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML());
  },
  editable: props.displayMode !== 'VIEW',
});
// Table functions
const insertTable = () => {
  console.log('Inserting default table...');
  if (editor.value) {
    editor.value
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }
};

const insertCustomTable = (rows, cols, withHeader = true) => {
  console.log(`Inserting custom table: ${rows}x${cols}`);
  if (editor.value) {
    editor.value
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: withHeader })
      .run();
  }
};
// Function to set link
const setLink = () => {
  const previousUrl = editor.value.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  // update link
  editor.value
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url })
    .run();
};

// Keyboard shortcuts
const handleKeyDown = event => {
  if (!editor.value || props.displayMode === 'VIEW') return;

  // Ctrl+Z for undo
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    editor.value.chain().focus().undo().run();
  }
  // Ctrl+Y or Ctrl+Shift+Z for redo
  else if (
    (event.ctrlKey && event.key === 'y') ||
    (event.ctrlKey && event.shiftKey && event.key === 'Z')
  ) {
    event.preventDefault();
    editor.value.chain().focus().redo().run();
  }
};

// Watch for displayMode changes
watch(
  () => props.displayMode,
  newMode => {
    if (editor.value) {
      editor.value.setEditable(newMode !== 'VIEW');
    }
  }
);

// Watch for modelValue changes from parent
watch(
  () => props.modelValue,
  newValue => {
    if (editor.value && editor.value.getHTML() !== newValue) {
      editor.value.commands.setContent(newValue);
    }
  }
);

// Add keyboard event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style lang="scss" scoped>
.editor {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  .tools {
    border-bottom: 1px solid #ddd;
    padding: 8px;
    display: flex;
    align-items: center;
    column-gap: 4px;
    row-gap: 8px;
    flex-wrap: wrap;
    .btn-tool {
      border: 1px solid #ddd;
      padding: 4px 6px;
      border-radius: 4px;
      width: 32px;
      height: 32px;
      font-size: 14px;
      font-weight: 500;
      .icon-white {
        display: none;
      }
      &.is-active {
        border: 1px solid #333;
        background-color: #333;
        color: #fff;
        .icon-dark {
          display: none;
        }
        .icon-white {
          display: block;
        }
      }
    }
    .tool-divider {
      background-color: transparent;
      width: 2px;
      height: 32px;
      margin: 0 4px;
      display: inline-block;
    }
    .btn-dropdown {
      position: relative;
      .btn-dropdown-content {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-top: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 100;
        width: max-content;
        min-width: 180px;
        display: none;
        padding: 8px;

        button {
          display: block;
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          border: none;
          background: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;

          &:hover {
            background-color: #f5f5f5;
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          &.text-red-600 {
            color: #dc2626;
          }
        }

        .dropdown-divider {
          height: 1px;
          background-color: #e5e5e5;
          margin: 8px 0;
        }
      }
      &:hover {
        .btn-dropdown-content {
          display: block;
        }
      }
    }
  }
  .editor-content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  :deep(.editor-content-wrapper > div) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  :deep(.ProseMirror) {
    padding: 8px;
    &:focus {
      outline: none;
    }
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    height: 0;
    h1 {
      font-size: 3rem;
      line-height: 1;
      font-weight: 800;
    }
    h2 {
      font-size: 2.25rem;
      line-height: 2.5rem;
      font-weight: 700;
    }
    h3 {
      font-size: 1.875rem;
      line-height: 2.25rem;
      font-weight: 700;
    }
    h4 {
      font-size: 1.5rem;
      line-height: 2rem;
      font-weight: 600;
    }
    h5 {
      font-size: 1.25rem;
      line-height: 1.75rem;
      font-weight: 600;
    }
    h6 {
      font-size: 1.125rem;
      line-height: 1.75rem;
      font-weight: 600;
    }
    ul {
      padding: 0 1rem;
      list-style-type: disc;
    }
    ol {
      padding: 0 1rem;
      list-style-type: decimal;
    }
    a {
      color: #007bff;
      text-decoration: underline;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    /* Table styles - Fixed selectors */
    table {
      border-collapse: collapse;
      margin: 16px 0;
      overflow: hidden;
      table-layout: fixed;
      width: 100%;
      border: 2px solid #333 !important;
      border-radius: 6px;
      box-shadow: #333 0px 0px 0px 2px;
      td,
      th {
        border: 1px solid #333;
        box-sizing: border-box;
        min-width: 1em;
        padding: 8px 12px;
        position: relative;
        vertical-align: top;
      }

      th {
        background-color: #f8f9fa;
        font-weight: bold;
        text-align: left;
        border-bottom: 2px solid #333;
      }

      .selectedCell:after {
        background: rgba(200, 200, 255, 0.4);
        content: '';
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        pointer-events: none;
        position: absolute;
        z-index: 2;
      }
    }

    /* Alternative table styling with class */
    .tiptap-table {
      border-collapse: collapse;
      margin: 16px 0;
      overflow: hidden;
      table-layout: fixed;
      width: 100%;
      border: 2px solid #333 !important;
      border-radius: 6px;

      td,
      th {
        border: 1px solid #333;
        box-sizing: border-box;
        min-width: 1em;
        padding: 8px 12px;
        position: relative;
        vertical-align: top;
      }

      th {
        background-color: #f8f9fa;
        font-weight: bold;
        text-align: left;
        border-bottom: 2px solid #333;
      }
    }

    .tableWrapper {
      padding: 1rem 0;
      overflow-x: auto;
    }

    .resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }
  }
}
</style>
