import React , { createContext,useState}from 'react';

export const SearchContext = createContext(null);

export const SearchProvider=(props)=> {
  const [mapPoint, setMapPoint] = useState();
  
  return (
    <SearchContext.Provider value={
      {
        mapPoint: mapPoint,
        setMapPoint,
      }
    }>
      {props.children}
    </SearchContext.Provider>
  )
  
}
