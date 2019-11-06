//
//  API.swift
//  TodayExtension
//
//  Created by Marcos Rodriguez on 11/2/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation

class API {
  
  static func fetchPrice(currency: String, completion: @escaping ((Dictionary<String, Any>?, Error?) -> Void)) {
    guard let url = URL(string: "https://api.coindesk.com/v1/bpi/currentPrice/\(currency).json") else {return}
    
    URLSession.shared.dataTask(with: url) { (data, response, error) in
      guard let dataResponse = data,
        let json = try? JSONSerialization.jsonObject(with: dataResponse, options: .mutableContainers) as? Dictionary<String, Any>,
        error == nil else {
          print(error?.localizedDescription ?? "Response Error")
          completion(nil, error)
          return }
      
      completion(json, nil)
    }.resume()
  }
  
  static func getUserPreferredCurrency() -> String {
    guard let userDefaults = UserDefaults(suiteName: "group.io.bluewallet.bluewallet"),
      let preferredCurrency = userDefaults.value(forKey: "preferredCurrency") as? String
      else {
        return "USD"
    }
    return preferredCurrency
  }
  
  static func getUserPreferredCurrencyLocale() -> String {
    guard let userDefaults = UserDefaults(suiteName: "group.io.bluewallet.bluewallet"),
      let preferredCurrency = userDefaults.value(forKey: "preferredCurrencyLocale") as? String
      else {
        return "en_US"
    }
    return preferredCurrency
  }
  
  static func getLastSelectedCurrency() -> String {
    guard let dataStore = UserDefaults.standard.value(forKey: "currency") as? String else {
      return "USD"
    }
    
    UserDefaults.standard.setValue(API.getUserPreferredCurrency(), forKey: "currency")
    return dataStore
  }
  
  static func saveNewSelectedCurrency() {
    UserDefaults.standard.setValue(API.getUserPreferredCurrency(), forKey: "currency")
  }
  
}
