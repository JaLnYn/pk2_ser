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
}
type AuthData {
  userId: ID!
  token: String!
  tokenExpiration: Int!
}

type Room {
  room_id: ID!
  parent_prop_id: ID
  sqr_area: Float!
  Images: [Image!]
}

type Property {
  prop_id: ID!
  prop_address: String!
  prop_city: String!
  prop_province: String!
  prop_country: String!
  longitude: Float!
  latitude: Float!
  landlord: User!
  info: String!
  price: Int!
  bedrooms: Int!
  utils: Boolean!
  parking: Int!
  furnished: Boolean!
  bathroom: Int!
  sqr_area: Float!
  preferred_unit: String!
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
}

type RootQuery {
  checkAccount(email: String!, password: String!): Boolean!
  login(email: String!, password: String!): AuthData!
  getFavorites(start_index: Int!,end_index: Int!): [Favorites!]
  getMyProperty(start_index: Int!, end_index: Int): [Property!]
  getMyImages: [Image]!

}

type RootMutation {
  signup(email: String!, password: String!, f_name: String!, l_name: String!, gender: String!, user_type: String!, date_of_birth: String!): User
  createProperty(prop_address: String!, prop_city: String!, prop_province: String!, prop_country: String!, longitude: Float!, latitude: Float!, info: String!, price: Int!, bedrooms: Int!, utils: Boolean!, parking: Int!, furnished: Boolean!, bathroom: Int!, sqr_area: Float!, preferred_unit: String!): Property
  deleteProperty(prop_id: ID!): Boolean!
  decideProperty(prop_id: ID!, liked: Boolean!): Boolean!
  unmatchProperty(prop_id: ID!): Boolean!
  createRoom(parent_prop_id: ID!, sqr_area: Float!): Room!
  deleteRoom(room_id: ID!): Boolean!
  addImageToRoom(img_id: ID!, room_id: ID): Boolean
  addImageToProp(img_id: ID!, prop_id: ID): Boolean
  rmImageToRoom(img_id: ID!, room_id: ID): Boolean
  rmImageToProp(img_id: ID!, prop_id: ID): Boolean
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`);


//  getProperty(start_index: Int!, end_index: Int!): [Property!]!