# 🎲 RPG Dice Rolls in Atom 🧙

This package for the Atom text editor lets you generate dice rolls and stats for tabletop games like Dungeons & Dragons directly in a text document. Use the key binding <kbd class="platform-all">Ctrl+R</kbd> or the command `rpg-dice:roll` to append a dice roll result to the end of the current line.

<a href="https://raw.githubusercontent.com/akstuhl/rpg-dice/main/asset/demo.gif" target="_blank">![demo.gif](https://raw.githubusercontent.com/akstuhl/rpg-dice/main/asset/demo.gif)</a>

The script will try to use selected text or text around the cursor to infer how many dice of how many sides to roll and what modifier to add. For example, try hitting <kbd class="platform-all">Ctrl+R</kbd> when the cursor is on `2d8`, `(-1)`, `(3d6 + 7)`, `3dF` (Fate/Fudge dice), or `(stat)`. You can repeat a roll by keeping the result selected. The default number and type of dice to use are configurable in settings.

Thank you to [JLDesignNetwork](https://github.com/JLDesignNetwork) for adding ability score pool generation along with several other improvements. See their [notes](https://github.com/akstuhl/rpg-dice/pull/3#issuecomment-762984940) and the package settings for more on stat features.
