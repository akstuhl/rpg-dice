const {CompositeDisposable} = require('atom')

module.exports = {
  subscriptions: null,

  activate () {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace',
      {'rpg-dice:roll': () => this.roll()})
    )
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  roll() {
    const editor = atom.workspace.getActiveTextEditor()
    if (editor) {
      let selection = editor.getSelectedText()
      if (selection.length < 1) {
        editor.selectWordsContainingCursors()
        atom.commands.dispatch(atom.views.getView(editor), 'bracket-matcher:select-inside-brackets')
        selection = editor.getSelectedText()
      }

      let diceCount = 1;
      let sides = 20;
      let modifierSign = '+'
      let modifier = 0;

      const regex = /(?: *\d* +\(?)?(?:(\d+)?d(\d+))? *(?:([+-]) *(\d+)?)?/i
      const matches = selection.match(regex)
      if (matches[1]) diceCount = +matches[1]
      if (matches[2]) sides = +matches[2]
      if (matches[3]) modifierSign = matches[3]
      if (matches[4]) modifier = +matches[4]

      if (modifierSign === '-') modifier *= -1

      let diceRoll = 0;
      for (let i = 0; i < diceCount; i++) {
        diceRoll += Math.floor(Math.random() * sides) + 1;
      }

      editor.moveToEndOfLine()

      const insertString = `  ${diceRoll + modifier} (${diceCount}d${sides}${modifierSign === '+' ? '+' : ''}${modifier})`
      editor.insertText(insertString, {select: true})
    }
  }
}
