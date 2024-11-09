
## Serverless REST Assignment - Distributed Systems.

__Name:__ Shane Whitmore

__Demo:__ [... link to your YouTube video demonstration ......](https://youtu.be/rcZHt4Y8hwA)

### !!!!!!!!!!!!!!! ATTENTION !!!!!!!!!!!!!!
Please use the 'AuthUpdate' branch as it contains the latest version of the assignment
### Context.

State the context you chose for your web API and detail the attributes stored in the main database table.

I chose to use music Artists and their songs as the context for this assignment. The main attributes include:
+ Artists: 
    + id
    + artistName
    + recordLabel
+ Songs:
    + artistId
    + genre
    + origional_language
    + title
    + artist
    + release_date
    + recordLabel



### App API endpoints.

#### App endpoints
+ POST /artists - add a new artist to the database (protected by authorisation)
+ GET /artists - get a list of all artists in the database
+ GET /artists/{artistId} - get a list of songs by an artist using the artistId
+ GET /artists/song?artistId=valueX - get all songs from an artist whos 'artistId' matches 'valueX'
+ GET /artists/song?artistId=valueX&recordLabel=valueY - get all songs from an artist whos 'artistId' matches 'valueX' and whos recordLabel matches 'valueY'
+ GET /artists/song?artistId=valueX&artist=valueY - get all songs from an artist whos 'artistId' matched 'valueX' and whos name matches 'valueY' 

#### Auth API endpoints
+ POST auth/signup allows users to create an account & a confimation code is sent via email
+ POST auth/confirm_signup allows user to confirm their email address via the code sent by email
+ POST auth/signin allows users to sign into their account and receive a token required for adding artists to the database
+ POST auth/signout allows users to sign out

### Update constraint (if relevant).

[Briefly explain your design for the solution to the PUT/Update constraint 
- only the user who added an item to the main table could update it.]


### Translation persistence (if relevant).

[Briefly explain your design for the solution to avoid repeat requests to Amazon Translate - persist translations so that Amazon Translate can be bypassed for repeat translation requests.]

###  Extra (If relevant).

[ State whether you have created a multi-stack solution for this assignment or used lambda layers to speed up update deployments. Also, mention any aspect of the CDK framework __that was not covered in the lectures that you used in this assignment. ]