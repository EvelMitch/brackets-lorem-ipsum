# Lorem Ipsum Generator for Brackets
An extension for [Brackets](https://github.com/adobe/brackets/) to produce
Lorem Ipsum text automatically.

### How to Install
1. Select **Brackets > File > Install Extension...**
2. Type or paste https://github.com/lkcampbell/brackets-lorem-ipsum into the
dialog box
3. Click on the **Install** button.
4. Reload or Restart Brackets -- normally not required but this extension
needs it.

### How to Use Extension
For plaintext Lorem Ipsum, type `lorem` then press the **Tab** key.

You can also add options to the `lorem` command with an underscore character
followed by the option name. For example: `lorem_wrap40.` Multiple options
can also be chained together. For example, typing `lorem_html_wrap40` and
then pressing the **Tab** key will give you html formatted Lorem Ipsum text
and a word wrap width of 40 characters.

**Note:** Options to the far right of the chain always have the highest
priority. If two options in the chain conflict with each other, the option
on the right will have precedence. For example, the command `lorem_nowrap_wrap40`
will insert Lorem Ipsum text with a word wrap width of 40 characters and the
command `lorem_wrap40_nowrap` will insert Lorem Ipsum text with no word wrapping.

##### List of Current Options
**_w[count]:** Inserts a certain number of random Lorem Ipsum words into the
current document.  The `count` option indicates how many words to insert.
For example, `lorem_w40` will insert 40 random words into the document.  If
the `count` option is not provided, one word will be inserted.

**_s[count]:** Inserts a certain number of random Lorem Ipsum sentences into
the current document.  The `count` option indicates how many sentences to insert.
For example, `lorem_s3` will insert three sentences into the document
If the `count` option is not provided, one sentence will be inserted.

**_p[count]:** Inserts a certain number of random Lorem Ipsum paragraphs into
the current document.  The `count` option indicates how many paragraphs to insert.
For example, `lorem_p3` will insert three paragraphs into the document
If the `count` option is not provided, one paragraph will be inserted.

**_short:** Makes all words, sentences, or paragraphs short length.

**_medium:** Makes all words, sentences, or paragraphs medium length.

**_long:** Makes all words, sentences, or paragraphs long length.

**_vlong:** Makes all words, sentences, or paragraphs very long length.

**_html:** Provides Lorem Ipsum text in HTML format.

**_nowrap:** Inserts Lorem Ipsum text without any word wrapping.

**_wrap[width]:** Word wraps Lorem Ipsum text using the specified `width`
For example, `lorem_wrap40` will wrap the text at 40 characters.  By default,
the word wrap option is on and the width is set to 80 characters.  If you want
to turn word wrap off, use the `.nowrap` option.

### Roadmap

* HTML links and lists
* Help documentation
* Error handling (highlight unrecognized portions of command)
* Improve randomized content: better dictionary and sentence structure

### License
MIT-licensed -- see `main.js` for details.

### Compatibility
Brackets Sprint 22 or later.
