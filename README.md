### recipe-explorer-vite

Simple application to store your recipes, currently the main feature is that you add your requirements for a recipe and it will ask an AI to generate one. The main goal of this application was to try coding with an ai, the 'vibe coding' thing. Where planning through to implementation was done with ai.

### Results of 'Vibe coding'

I used [this](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/) as the starting point for my exploration into this territory.

During the planning stage I used ChatGPT to ultimately get both a [plan breakdown](breakdown-plan.md) and a [todo](todo.md) of the steps. The steps I ultimately used to feed to the ai in my IDE (cursor) and the IDE wrote most (>95%) of the code. The code it wrote worked for the most part I had some troubles when it was dealing with versions of things (it was adamant that tailwind css is at v14 and v16 is actually an oldewr version) and also it is not great with refactoring (it sometimes would create new files and re-implement a thing and then never delete the first file, it was also good at repeating code). Also the tests that it wrote took some time to get correct, it would spit out tests possibly changing the original source code, which may have broken other tests, for me it was a test of endurance. My thoughts are that it is a mid-coder (not quite senior but not junior either) but the ai will probably get better quicker. Also, with better prompting I could probably get it to focus, make sure to re-use what is there or add 'please be precise' to my prompt.

I am definitely going to do this again but I want to be more thoughtful with my prompts during coding, I think I will get better results. Also, the ai in cursor offered to write a [retrospective doc](RETROSPECTIVE.md) to sum up what we did and that was a nice piece of data.

### Further thoughts on 'Vibe coding' 

I have followed this pattern that I used here and I have realized that this was not _true_ Vibe coding but more using the ai as a resource for just writing a lot of code and then reviewing it and asking for changes or making edits myself. I have done a small amount of Vibe coding, which is asking the ai to make a whole app and treating the code as a black box, while interesting that is not what I am doing.
