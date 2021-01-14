# rpg-dice package 🎲

This package lets you generate dice rolls for Dungeons & Dragons or similar RPGs directly in a text document. Use the key binding <kbd class="platform-all">Ctrl+R</kbd> or the command `rpg-dice:roll-dice` to append a dice roll result to the end of the current line.

The script will try to use selected text or text around the cursor to infer how many dice of how many sides to roll and what modifier to add. For example, try hitting <kbd class="platform-all">Ctrl+R</kbd> when the cursor is on `-1`, `2d6`, or `(3d4 + 7)`. You can repeat a roll by keeping the result selected. The default numbers of dice and sides to use are configurable in settings.
