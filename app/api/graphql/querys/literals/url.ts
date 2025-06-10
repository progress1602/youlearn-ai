export const submitURLMutation = (fileUrl: string, username: string) =>{
  return `
mutation submitaudiourl {
  submitURL(input: {
    url: "${fileUrl}", username: "${username}"
  }){
    id
    fileType
    createdAt
    url
  }
}
`;
} ;


export const submitLinkMutation = (inputValue: string, username: string) => `
mutation submitAudioURL {
  submitURL(input: { url: "${inputValue.trim()}", username: "${username}" }) {
    id
    fileType
    createdAt
    url
    username
  }
}
`;


export const getSessionsQuery = `
  query GetSessions($username: String!) {
    getSessions(username: $username) {
      id
      url
      username
      title
      createdAt
      fileType
      userId
    }
  }
`;
