const mdns = (state = [], action) => {

  let devices, mapped
  
  switch (action.type) {
  case 'ADAPTER':
    if (!action.store || !action.store.login || !action.store.login.device)
      return []

    mapped = action.store.login.device.map(dev => ({
      name: dev.name,
      address: dev.address,
      model: dev.model,
      serial: dev.serial
    }))

    return state.length === mapped.length && 
      state.every((item, index) => 
        item.name === mapped[index].name &&
        item.address === mapped[index].address &&
        item.model === mapped[index].model &&
        item.serial === mapped[index].serial
      ) ?  state : mapped

  default: 
    return state
  }
}

export default mdns

