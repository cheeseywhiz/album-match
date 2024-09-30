# vitals server

## TODO

* use http module for magic numbers and messages

## TODO

NEXT

- add static file server
- add album cover url to album table
- add test data
- add scipt on load-test-data to copy test data album covers into the static file server location

## TODO

- execute the sync plan
  - download image from url using discogs client
  - save to file location
  - execute sql transactions

## TODO

- add helper and API to get list of albums to add and remove
- upon confirmation we will have to re-calculate the collection. This seems like the best we can do for now. I think celery has support for multi-step processes, I will have to see if that is a thing and if it is relevant here.

## TODO

- add sides information to albums table
- do this after adding sync support

## TODO

- then add stats!
