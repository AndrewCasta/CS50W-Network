# CS50W-Network

This project is a social media clone, and is a project from the CS50w course.

[Full requirements & outline can be found here](https://cs50.harvard.edu/web/2020/projects/4/network/)

### Technology
This project uses a Django backend, & vanilla HTML, CSS & JS on the frontend. After the initial page is requested, all updates are make to the page via JS calling apis and updating the DOM.

### Installing
In your terminal, `cd` into the project4 directory.
Run `python manage.py makemigrations network` to make migrations for the network app.
Run `python manage.py migrate` to apply migrations to your database.

Then, from the top network folder run `python manage.py runserver`

You'll need to create an account and start making posts. Then create another accout to follow & like those posts etc.
