const { buildSchema } = require('graphql');

module.exports = buildSchema(`

type User {
  id: ID!
  email: String!
  password: String
  f_name: String
  l_name: String
  gender: String
  user_type: String
  date_of_birth: String
  registration_date: String
  bio: String
  profile_pic: ID
  img_loc: String
}
type AuthData {
  userId: ID!
  token: String!
  tokenExpiration: Int!
  user_type: String!
}

type Room {
  room_id: ID!
  parent_prop_id: ID
  sqr_area: Float!
  Images: [Image!]
}

type Property {
  prop_id: ID!,
  apt_num: Int!,
  prop_address: String!,
  prop_city: String!,
  prop_province: String!,
  prop_country: String!,
  longitude: Float!,
  latitude: Float!,
  landlord: User!,
  info: String!,
  price: Int!,
  bedrooms: Int!,
  utils: Boolean!,
  parking: Int!,
  furnished: Boolean!,
  bathroom: Int!,
  sqr_area: Float!,
  avail_on: String!, 
  rooms: [Room!]
  Images: [Image!]
}

type Favorites {
  liked: Boolean!
  decision_date: String!
  unmatched_date: String
  property: Property!
}

type Image{
  img_id: ID!,
  img_loc: String!
  info: String
  order_num: Int
}

type RootQuery {
  getUser(id: ID!): User!
  checkAuth: Boolean!
  checkAccount(email: String!, password: String!): Boolean!
  login(email: String!, password: String!): AuthData!
  getFavorites(start_index: Int!,end_index: Int!): [Favorites!]
  getMyProperty(start_index: Int!, end_index: Int): [Property!]
  getMyImages: [Image]!
  getOneProperty(id: ID!): Property!
  getFilteredProperty(lon: Float!, lat: Float!, rad: Float!, start: Float!, end: Float!): [Property!]
}

type RootMutation {
  signup(email: String!, password: String!, f_name: String!, l_name: String!, gender: String!, user_type: String!, date_of_birth: String!): User
  updateUser(user_type: String, bio: String): User
  createProperty(apt_num: Int, prop_address: String!, prop_city: String!, prop_province: String!, prop_country: String!, longitude: Float!, latitude: Float!, info: String, price: Int!, bedrooms: Int!, utils: Boolean!, parking: Int!, furnished: Boolean!, bathroom: Int!, sqr_area: Float!, avail_on: String!): Property
  updateProperty(prop_id: ID!, info: String, price: Int!, bedrooms: Int!, utils: Boolean!, parking: Int!, furnished: Boolean!, bathroom: Int!, avail_on: String!): Property
  deleteProperty(prop_id: ID!): Boolean!
  decideProperty(prop_id: ID!, liked: Boolean!): Boolean!
  unmatchProperty(prop_id: ID!): Boolean!
  createRoom(parent_prop_id: ID!, sqr_area: Float!): Room!
  deleteRoom(room_id: ID!): Boolean!
  addImageToRoom(img_id: ID!, room_id: ID): Boolean
  addImageToProp(img_id: ID!, prop_id: ID): Boolean
  rmImageToRoom(img_id: ID!, room_id: ID): Boolean
  rmImageToProp(img_id: ID!, prop_id: ID): Boolean
  setPropertyPicInfo(prop_id: ID!,order_num: Int!, info: String): Boolean
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`);


//  getProperty(start_index: Int!, end_index: Int!): [Property!]!
