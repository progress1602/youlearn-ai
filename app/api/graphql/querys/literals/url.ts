export const submitURLMutation = (fileUrl: string) =>{
  return `
mutation submitaudiourl {
  submitURL(input: {
    url: "${fileUrl}"
  }){
    id
    fileType
    createdAt
    url
  }
}
`;
} ;


export const submitLinkMutation = (inputValue: string) => `
mutation submitAudioURL {
  submitURL(input: { url: "${inputValue.trim()}" }) {
    id
    fileType
    createdAt
    url
  }
}
`

export const getSessionsQuery = `
  query getsessions {
      getSessions {
        id
        url
        userId
        title
        createdAt
      }
    }
`                                                                            
