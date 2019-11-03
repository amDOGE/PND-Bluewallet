//
//  API.swift
//  TodayExtension
//
//  Created by Marcos Rodriguez on 11/2/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation

class API {
      
  static func fetchPrice(currency: String = "USD", completion: @escaping ((APIResponse) -> Void)) {
    guard let url = URL(string: "https://api.coindesk.com/v1/bpi/currentPrice/\(currency).json") else {return}
    let task = URLSession.shared.dataTask(with: url) { (data, response, error) in
    guard let dataResponse = data,
          let responseDecoded = try? JSONDecoder().decode(APIResponse.self, from: dataResponse),
          error == nil else {
              print(error?.localizedDescription ?? "Response Error")
              return }
      completion(responseDecoded)
    }
    task.resume()
  }
  
}
