const {CompositeDisposable} = require('atom')

module.exports = {
  subscriptions: null,

  config: {
    defaultDieSides: {
      title: 'Default die sides',
      description: 'Roll a this-sided die when the number of sides is not inferred from local text.',
      type: 'integer',
      default: 20
    },

    defaultDiceCount: {
      title: 'Default number of dice',
      description: 'Roll this many dice when the number to roll is not inferred from local text.',
      type: 'integer',
      default: 1
    }
  },

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

      let diceCount = atom.config.get('rpg-dice.defaultDiceCount')
      let sides = atom.config.get('rpg-dice.defaultDieSides')
      let modifierSign = '+'
      let modifier = 0;

      const regex = /(?:[^\d]*\d* +\(?)?(?:(\d+)?d(\d+))? *(?:([+-]) *(\d+)?)?/i
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

      let insertString = '  '
      if (diceCount === 1 && sides === 20) {
        if (diceRoll === 1) insertString += '💣'
        else if (diceRoll === 20) insertString += '🌟'
      }
      insertString += `${diceRoll + modifier} (${diceCount}d${sides}${modifierSign === '+' ? '+' : ''}${modifier})`
      editor.insertText(insertString, {select: true})
    }
  }
}
