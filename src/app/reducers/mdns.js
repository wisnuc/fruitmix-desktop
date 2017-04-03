export default (state = [], action) => 
  action.type === 'MDNS_UPDATE'
    ? action.data
    : state

