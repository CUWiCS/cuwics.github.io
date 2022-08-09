## Official website of Columbia University's Women in Computer Science (WiCS)
### See the final version live [here](http://www.cs.columbia.edu/wics/)!

Made using a template from the [Agency](http://startbootstrap.com/template-overviews/agency/) template at [Start Bootstrap](http://startbootstrap.com/).
It features a smooth scrolling one page theme, with an external blogging section run by Jekyll. For more information about the site, please contact WiCS using the form on our official website.

***
#### Updating team photos:
1. Make sure that every profile photo is 225x225 pixels, otherwise the layout will break. Thanks!
***
#### Updating sponsor logos:
1. Make sure that every logo is put on a 300x300 pixel white square, otherwise the layout will break. Thanks!

***

#### How to make a blog post:
1. Create a new file inside `_posts/year` named `year-month-day-postTitle.markdown` where `year-month-day` is the date you wish to publish, and `postTitle` is the title of the post.
2. Every post should include YAML front matter and is written with Markdown.  
   http://jekyllrb.com/docs/frontmatter/  
   http://jekyllrb.com/docs/posts/
3. The basic front matter to include (including the 3 dashes):

    ```
    ---
    layout: post
    title: "Title of blog post"
    date: year-month-day
    categories: news
    ---
    ```

4. You can continue typing anything below that. For formatting, links, and images look up how to do that with Markdown! Otherwise, browse around existing posts to see examples.
5. To test how the post will look locally, run "`jekyll serve`" from root folder.

***
#### How to style the blog:  
1. The homepage is in `blog.html`. This file only includes the posts section of the page. The rest of the page is in `_layouts/blog.html`. The `blog.html` in the root folder is included in the section marked `{{ content }}` inside `_layouts/blog.html`. This "layout" file includes `head.html` and `footer.html` which are located in the same folder. `head.html` includes css files.

2. Individual post pages use `_layouts/post.html`. It uses the same `blog.html` layout as the blog home page, but the post content area is styled differently in `post.html`

***
#### How to change emails for the contact form:
1. For each category of inquiry on the contact form (i.e. listserv announcement, company collaboration, anything else), emails get sent to different board members (i.e. Publicity Chair, Corporate Chairs, President, respectively).

2. To change the email addresses, go into `js/contact_me.js` to lines 25-34. Change email addresses as fit for the variable `email_add`, add a second email if needed using the specified `cc` variable. 
