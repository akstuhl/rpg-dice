const {CompositeDisposable} = require('atom')

module.exports = {
    subscriptions: null,

    config: {
        defaultDieSides: {
            title: 'Default Die Sides',
            description: 'This is the number of sides per die.',
            type: 'integer',
            default: 20
        },

        defaultDiceCount: {
            title: 'Default Number of Dice',
            description: 'This is the number of dice used for the roll.',
            type: 'integer',
            default: 1
        },

        statsDSGM: {
            title: 'Default Stat Gen Method',
            description: 'The preferred method for generating ability stats. Accepted values are 3 or 4. Method 3 rolls 3d6 for each ability, a number of times based on the default roll count setting above and returns the best totals from each set. Method 4 rolls 1d6, 4 times per ability, drops the lowest roll, then tallies the remaining 3 rolls.',
            type: 'integer',
            default: 3
        },

        statsDRC: {
            title: 'Default Roll Count',
            description: 'This setting only applies for stat generation using method 3, and is the number of 3d6 rolls to make per stat.',
            type: 'integer',
            default: 3
        },

        verbose: {
            title: 'Verbose',
            description: 'Append dice and modifier info to (non-stat) roll results, for instance: 23 (5d8+2)',
            type: 'boolean',
            default: false
        }
    },

    activate () {
        this.subscriptions = new CompositeDisposable()
        this.subscriptions.add(atom.commands.add('atom-workspace',{
            'rpg-dice:roll': () => this.roll()})
        )
    },

    deactivate () {
      this.subscriptions.dispose()
    },

    stats (method, count) {
      let multipleRolls = (method != 3 || count < 1) ? false : true;
      let stats = new Array();
      let dev = `Stat generation using method ${method}d6`;

      switch(method) {
          case 3:
              if (count !== 0) {
                  dev += `, ${count} times per set. Selecting the best score from each set.\n`;
              }
              /*
                  In this method we roll 3d6 and tally the result.
                  We do this {COUNT} amount of times (depends on the
                  parameter 'count') for each stat. This allows
                  for the best roll results to be returned.
               */
              if (multipleRolls) {                                        // we are making multiple 3d6 rolls and saving the best
                  // record 1 roll, per stat
                  for (let i = 0; i < 6; i++) {
                      // create a temporary array to hold values
                      let arr = new Array();
                      // simulate 3d6 dice rolls {COUNT} times
                      for (let x = 0; x < count; x++) {
                          // add the result to the temp array
                          arr.push(this.rollDice(3,6));
                      }
                      // sort from best to worst
                      arr.sort((a,b) => b - a);
                      dev += `Set ${i + 1}: ${arr}\n`;
                      // add first (best roll) element to final array
                      stats.push(arr[0]);
                  }
                  dev += `Final stat array: ${stats}`;
              } else {                                                    // we are rolling 3d6 once per stat.
                  for (let i = 0; i < 6; i++) {
                      stats.push(this.rollDice(3,6));
                  }
                  dev += `Final stat array: ${stats}`;
              }
              console.log(dev);
              break;
          case 4:
              dev += `. Roll 1d6, 4 times per stat. Drop the worst d6 roll, tally the remaining 3.\n`;
              /*
                  In this method, we roll 1d6, 4 times. We then
                  drop the lowest roll and tally the remaining
                  3 to generate 1 ability stat. The process is
                  repeated 5 more times to generate all 6 ability
                  stats.
               */
              // record 1 tallied score per stat
              for (let i = 0; i < 6; i++) {
                  // create temporary array to hold values
                  let arr = new Array();
                  // simulate rolling 1d6, 4 times.
                  for (let x = 0; x < 4; x++) {
                      // push the 1d6 result to the temporary array
                      arr.push(this.rollDice(1,6));
                  }
                  // sort from best to worst.
                  arr.sort((a,b) => b - a);
                  // remove the worst roll from the array
                  arr.pop();
                  // tally the remaining rolls and add the total to final array.
                  stats.push(arr.reduce((a,b) => a + b, 0));
                  dev += `Best of set ${i + 1}: ${arr}\n`;
              }
              dev += `Final stat array: ${stats}`;
              console.log(dev);
              break;
      }
      return stats;
    },

    rollDice (dice, sides) {
      let total = 0;
      for (let i = 0; i < dice; i++) {
          total += Math.floor(Math.random() * sides) + 1;
      }
      return total;
    },

    adjustSelection () {

    },

    roll () {
        const editor = atom.workspace.getActiveTextEditor();
        const regex = [
            /^(?:(?<dice>\d+)?d(?<sides>\d+))? *(?:(?<sign>[\+]?|-)* *(?<modifier>\d+)?)?$/i,
            /^STATS?(?::(?<method>\d)(?:-(?<count>\d+))?)?$/i
        ];
        let dice = atom.config.get('rpg-dice.defaultDiceCount');
        let sides = atom.config.get('rpg-dice.defaultDieSides');
        let sign = '+';
        let mod = 0;
        let method = atom.config.get('rpg-dice.statsDSGM');
        let count = atom.config.get('rpg-dice.statsDRC');
        let type, roll, res, output;

        if (editor) {
            // attempt to select the dice roll
            let selection = editor.getSelectedText();
            // if the selection failed, try selection another way.
            if (selection.length < 1) {
                editor.selectWordsContainingCursors();
                atom.commands.dispatch(atom.views.getView(editor), 'bracket-matcher:select-inside-brackets');
                selection = editor.getSelectedText();
            }
            let range = editor.getSelectedBufferRange();
            console.log(`Selection: ${selection}\nBuffer Range: ${range}\n`);
            /*
                regex pattern matching to determine the
                type of roll.
             */
            if (matches = selection.match(regex[0])) {                          // attack rolls, ability checks, damage rolls, etc.
                if (typeof matches.groups.dice !== 'undefined') {
                    dice = parseInt(matches.groups.dice);
                }
                if (typeof matches.groups.sides !== 'undefined') {
                    sides = parseInt(matches.groups.sides);
                }
                if (typeof matches.groups.sign !== 'undefined') {
                    sign = matches.groups.sign;
                }
                if (typeof matches.groups.modifier !== 'undefined') {
                    mod = parseInt(matches.groups.modifier);
                }
                mod = (sign === '-' ? mod * -1 : mod);
                roll = this.rollDice(dice, sides);
                res = roll + mod;
                type = (sides === 20 ? 'check' : 'damage');
                console.log({
                    'roll-type': type,
                    'dice':dice,
                    'sides':sides,
                    'sign':sign,
                    'modifier':mod,
                    'roll':roll,
                    'result':res
                });
                editor.moveToEndOfLine();
                output = ' | ';
                if (roll === dice) output += '💣';
                else if (roll === dice*sides) output += '🌟';
                else (output += ' ');
                output += `${res.toString().padStart(2)}`;
                if (atom.config.get('rpg-dice.verbose')) {
                  output += ` (${dice}d${sides}${sign === '+' ? '+' : ''}${mod})`
                }
                output = output.padStart(5);
            } else if (matches = selection.match(regex[1])) {
                if (typeof matches.groups.method !== 'undefined'
                    && -1 !== [3,4].indexOf(parseInt(matches.groups.method))
                ) {
                    method = parseInt(matches.groups.method);
                }
                if (typeof matches.groups.count !== 'undefined') {
                    count = parseInt(matches.groups.count);
                }
                if (method === 4) {count = 0;}
                roll = 0;
                let statRolls = this.stats(method, count);
                let s = new Array();
                statRolls.forEach(function(r) {
                    let m = Math.floor((r - 10) / 2);
                    m = (m >= 0) ? '+' + m : m;
                    s.push(`${r.toString().padStart(2)} (${m.toString().padStart(2)})`);
                });
                console.log({
                    'method':method,
                    'count':count,
                    'stats-array':statRolls,
                    'results':s
                });
                // increase size of selection by 1, both left and right. (selects brackets)
                let startColumn = range.start.column -1;
                let endColumn = range.end.column +1;
                editor.setSelectedBufferRange([[range.start.row, startColumn],[range.end.row, endColumn]]);
                output = `Ability Score Pool:`;
                output += s.join(' | ').padStart(59);
            } else {
                output = `Cannot determine a suitable use for '${selection}'.\n`;
            }

            editor.insertText(output);
            if (-1 !== ['check','damage'].indexOf(type)) {
                editor.setSelectedBufferRange([[range.start.row, range.start.column],[range.end.row, range.end.column]]);
            }
            console.log(`Selection: ${selection}\nBuffer Range: ${range}`);
        }
    }
}
