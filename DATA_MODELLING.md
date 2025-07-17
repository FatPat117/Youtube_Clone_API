# YouTube Clone API - Data Models and Associations

## Data Association Diagram

The YouTube Clone API uses the following key models and relationships:

- **User**: Central entity for authentication and profile
- **Video**: Content uploaded by users
- **Comment**: User feedback on videos
- **Like**: Engagement for videos and comments
- **Subscription**: Connection between users (channels)
- **Playlist**: Collection of videos curated by users
- **Notification**: System alerts for user activities
- **ChannelAnalytics**: Performance metrics for channels

## Model Relationships

1. **User**

      - Has many Videos (one-to-many)
      - Has many Comments (one-to-many)
      - Has many Playlists (one-to-many)
      - Has many Likes (one-to-many)
      - Has many Subscriptions as subscriber (one-to-many)
      - Has many Subscriptions as channel (one-to-many)
      - Has watch history of Videos (many-to-many)
      - Has many Notifications as recipient (one-to-many)
      - Has many Notifications as sender (one-to-many)
      - Has one ChannelAnalytics (one-to-one)
      - Has channel metadata (description, tags, social links)

2. **Video**

      - Belongs to one User (many-to-one)
      - Has many Comments (one-to-many)
      - Has many Likes (one-to-many)
      - Belongs to many Playlists (many-to-many)
      - Watched by many Users (many-to-many)
      - Has share count and platform links
      - Can be referenced in Notifications

3. **Comment**

      - Belongs to one User (many-to-one)
      - Belongs to one Video (many-to-one)
      - Can have a parent Comment (self-referential)
      - Has many child Comments (one-to-many)
      - Has many Likes (one-to-many)
      - Can be referenced in Notifications

4. **Like**

      - Belongs to one User (many-to-one)
      - Belongs to either one Video OR one Comment (polymorphic)

5. **Subscription**

      - Connects a User (subscriber) to another User (channel)
      - Represents a many-to-many relationship between Users
      - Can trigger Notifications

6. **Playlist**

      - Belongs to one User (many-to-one)
      - Contains many Videos (many-to-many)

7. **Notification**

      - Belongs to one recipient User (many-to-one)
      - Belongs to one sender User (many-to-one)
      - Has a type (subscription, comment, reply, video)
      - Can reference a Video or Comment (polymorphic)
      - Has read status

8. **ChannelAnalytics**
      - Belongs to one User/Channel (one-to-one)
      - Tracks metrics (views, subscribers, videos, likes, comments)
      - Maintains historical daily statistics

### Data Association Diagram

```
┌───────────────┐     owns     ┌───────────────┐
│               │◄────────────┤               │
│     User      │              │     Video     │
│               │─────────────►│               │
└───────────────┘   watches    └───────────────┘
        △                              △
        │                              │
   subscribes                       contains
        │                              │
        ▼                              ▼
┌───────────────┐              ┌───────────────┐
│               │              │               │
│ Subscription  │              │   Comment     │
│               │              │               │
└───────────────┘              └───────────────┘
                                      △
                                      │
                                    parent
                                      │
                                      ▼
┌───────────────┐              ┌───────────────┐
│               │  contains    │               │
│   Playlist    │◄─────────────┤     Like      │
│               │              │               │
└───────────────┘              └───────────────┘
```
