//
//  TodayDataStore.swift
//  TodayExtension
//
//  Created by Marcos Rodriguez on 11/3/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation

struct TodayDataStore {
  let rate: String
  let lastUpdate: String
}

class TodayData {
  
  static let TodayDataStoreKey = "TodayDataStoreKey"
  static let TodayCachedDataStoreKey = "TodayCachedDataStoreKey"
  
  static func savePriceRateAndLastUpdate(rate: String, lastUpdate: String) {    
    UserDefaults.standard.setValue(["rate": rate, "lastUpdate": lastUpdate], forKey: TodayDataStoreKey)
    UserDefaults.standard.synchronize()
  }
  
  static func getPriceRateAndLastUpdate() -> TodayDataStore? {
    guard let dataStore = UserDefaults.standard.value(forKey: TodayDataStoreKey) as? [String: String], let rate = dataStore["rate"], let lastUpdate = dataStore["lastUpdate"] else {
      return nil
    }
    return TodayDataStore(rate: rate, lastUpdate: lastUpdate)
   }
  
  static func saveCachePriceRateAndLastUpdate(rate: String, lastUpdate: String) {
    UserDefaults.standard.setValue(["rate": rate, "lastUpdate": lastUpdate], forKey: TodayCachedDataStoreKey)
    UserDefaults.standard.synchronize()
  }
  
  static func getCachedPriceRateAndLastUpdate() -> TodayDataStore? {
    guard let dataStore = UserDefaults.standard.value(forKey: TodayCachedDataStoreKey) as? [String: String], let rate = dataStore["rate"], let lastUpdate = dataStore["lastUpdate"] else {
      return nil
    }
    return TodayDataStore(rate: rate, lastUpdate: lastUpdate)
   }
  
  
   
   
}
