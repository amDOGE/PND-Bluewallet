//
//  TodayViewController.swift
//  TodayExtension
//
//  Created by Marcos Rodriguez on 11/2/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import UIKit
import NotificationCenter

class TodayViewController: UIViewController, NCWidgetProviding {
  
  @IBOutlet weak var lastUpdatedDate: UILabel!
  @IBOutlet weak var priceLabel: UILabel!
  private let numberFormatter = NumberFormatter()
  private let isoDateFormatter = ISO8601DateFormatter()
  private let dateFormatter = DateFormatter()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    numberFormatter.numberStyle = .decimal
    dateFormatter.timeStyle = .short
    dateFormatter.dateStyle = .short
    
    if let lastStoredTodayStore = TodayData.getPriceRateAndLastUpdate() {
      processRateAndLastUpdate(todayStore: lastStoredTodayStore)
    }
  }
  
  func processRateAndLastUpdate(todayStore: TodayDataStore) {
    if let rateNumber = numberFormatter.number(from: todayStore.rate) {
      numberFormatter.numberStyle = .currency
      priceLabel.text  = numberFormatter.string(from: rateNumber)
    }
    
    if let dateFormatted = isoDateFormatter.date(from: todayStore.lastUpdate) {
      lastUpdatedDate.text = dateFormatter.string(from: dateFormatted)
    }
  }
  
  func widgetPerformUpdate(completionHandler: (@escaping (NCUpdateResult) -> Void)) {
    // Perform any setup necessary in order to update the view.
    
    // If an error is encountered, use NCUpdateResult.Failed
    // If there's no update required, use NCUpdateResult.NoData
    // If there's an update, use NCUpdateResult.NewData
    
    API.fetchPrice(completion: { (result, error) in
      DispatchQueue.main.async { [weak self] in
        guard let result = result else {
          completionHandler(.failed)
          return
        }
        
        guard let rateString = result.bpi?.uSD?.rate,
          let lastUpdatedString = result.time?.updatedISO
          else {
            return
        }
        
        let todayStore = TodayDataStore(rate: rateString, lastUpdate: lastUpdatedString)
        
        if let lastStoredTodayStore = TodayData.getPriceRateAndLastUpdate(), lastStoredTodayStore.lastUpdate == todayStore.lastUpdate {
          completionHandler(.noData)
        } else {
          self?.processRateAndLastUpdate(todayStore: todayStore)
          TodayData.savePriceRateAndLastUpdate(rate: todayStore.rate, lastUpdate: todayStore.lastUpdate)
          completionHandler(.newData)
        }
      }
    })
  }
  
}
