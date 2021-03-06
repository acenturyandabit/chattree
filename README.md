# Chat Tree
By Christie Zhu, Lewis Watts, Steven Liu and Eliza Smedley, 2019.
## What is it?
Chat Tree is a chrome extension for visualising Messenger chats in a tree-like format. 
It also happens to contain a powerful set of functions to access and listen to messages in Messenger!
## How can I download it?
For Chrome, simply head [here, to download it from the Chrome Web Store.](https://chrome.google.com/webstore/detail/chat-tree/fjejdehlndcmcciepbpielnigfnaefpc) 

![A screenshot of the product.](screenshot.png "This opens little windows on your chat screen.")

## I want to contribute!

The project is hosted open source on our github [our github repository](http://github.com/acenturyandabit/chattree).

If you've noticed a bug, feel free to open an issue or submit a pull request! 

Alternatively, you can code your own module based on the template file in `modules/template.js`.

## Remaining issues

Sadly we couldn't squash all the bugs that were in the project, though we got pretty far!

The issues that remain include:

- Some sizing issues with new buttons on the sidebar: after more than 3 sidebars the window starts shifting around uncomfortably
- When users login / logout on the same device they may be able to see other users' messages
- With a large number of messages it takes a considerable amount of time to load the chattree.
- Network timing issues: The current method of fetching chat IDs and fetching messages occasionally results in data mismatch when new threads are loaded.
- User names need to be implemented!


## Potential user preference

There are still some potential issues due to user preference:

- Some users may prefer to separate instances of Chattree windows when messaging different people.

## Future Development

To people who might intend to optimise the project:

- The project is implemented  using Google Extension. This may limit the scope of users. 
- At the moment, the tree is structured based on  manual setting and replies. NLP(Natural Language Processing) could potantially optimise user experiences.
- Between different threads, the chat tree does not appropriately remmeber the viewport position of the SVG.
- It would be nice if the user could click messages in chattree to focus the corresponding message in the chat.
