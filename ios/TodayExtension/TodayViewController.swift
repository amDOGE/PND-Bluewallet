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
  
  
  @IBOutlet weak var currencyLabel: UILabel!
  @IBOutlet weak var lastUpdatedDate: UILabel!
  @IBOutlet weak var priceLabel: UILabel!
  
  @IBOutlet weak var lastPriceArrowImage: UIImageView!
  @IBOutlet weak var lastPrice: UILabel!
  @IBOutlet weak var lastPriceFromLabel: UILabel!
  private var lastPriceNumber: NSNumber?
  
  private let numberFormatter = NumberFormatter()
  private let isoDateFormatter = ISO8601DateFormatter()
  private let dateFormatter = DateFormatter()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    numberFormatter.numberStyle = .decimal
    numberFormatter.maximumFractionDigits = 2
    numberFormatter.minimumFractionDigits = 2
    dateFormatter.timeStyle = .short
    dateFormatter.dateStyle = .short
    setLastPriceOutletsHidden(isHidden: true)
    if let lastStoredTodayStore = TodayData.getPriceRateAndLastUpdate() {
      lastPriceNumber = processRateAndLastUpdate(todayStore: lastStoredTodayStore)
    } else {
      setLastPriceOutletsHidden(isHidden: true)
    }
  }
  
  func setLastPriceOutletsHidden(isHidden: Bool) {
    lastPrice.isHidden = isHidden
    lastPriceFromLabel.isHidden = isHidden
    lastPriceArrowImage.isHidden = isHidden
  }
  
  func processRateAndLastUpdate(todayStore: TodayDataStore) -> NSNumber? {
    numberFormatter.numberStyle = .decimal
    guard let rateNumber = numberFormatter.number(from: todayStore.rate), let dateFormatted = isoDateFormatter.date(from: todayStore.lastUpdate) else { return numberFormatter.number(from: todayStore.rate) }
    
    numberFormatter.numberStyle = .currency
    priceLabel.text  = numberFormatter.string(from: rateNumber)
    lastUpdatedDate.text = dateFormatter.string(from: dateFormatted)
    return rateNumber
  }
  
  func processStoredRateAndLastUpdate(todayStore: TodayDataStore) -> NSNumber? {
    numberFormatter.numberStyle = .decimal
    guard let lastPriceNumber = numberFormatter.number(from: todayStore.rate) else { return numberFormatter.number(from: todayStore.rate) }
    
    numberFormatter.numberStyle = .currency
    lastPrice.text = numberFormatter.string(from: lastPriceNumber)
    return lastPriceNumber
  }
  
  func widgetPerformUpdate(completionHandler: (@escaping (NCUpdateResult) -> Void)) {
    // Perform any setup necessary in order to update the view.
    
    // If an error is encountered, use NCUpdateResult.Failed
    // If there's no update required, use NCUpdateResult.NoData
    // If there's an update, use NCUpdateResult.NewData
    let userPreferredCurrency = API.getUserPreferredCurrency();
    self.numberFormatter.currencyCode = userPreferredCurrency
    self.numberFormatter.locale = Locale(identifier: API.getUserPreferredCurrencyLocale())
    self.currencyLabel.text = userPreferredCurrency
    API.fetchPrice(currency: userPreferredCurrency, completion: { (result, error) in
      DispatchQueue.main.async { [unowned self] in
        guard let result = result else {
          completionHandler(.failed)
          return
        }
        
        guard let bpi = result["bpi"] as? Dictionary<String, Any>, let preferredCurrency = bpi[userPreferredCurrency] as? Dictionary<String, Any>, let rateString = preferredCurrency["rate"] as? String,
          let time = result["time"] as? Dictionary<String, Any>, let lastUpdatedString = time["updatedISO"] as? String
          else {
            return
        }
        
        let todayStore = TodayDataStore(rate: rateString, lastUpdate: lastUpdatedString)
        
        if let lastStoredTodayStore = TodayData.getPriceRateAndLastUpdate(), lastStoredTodayStore.lastUpdate == todayStore.lastUpdate, rateString == lastStoredTodayStore.rate, API.getLastSelectedCurrency() == userPreferredCurrency {
          completionHandler(.noData)
        } else {
          let newRate = self.processRateAndLastUpdate(todayStore: todayStore)
          let priceRiceAndLastUpdate = TodayData.getPriceRateAndLastUpdate()
          let lastPriceNumber = self.processStoredRateAndLastUpdate(todayStore: priceRiceAndLastUpdate ?? todayStore)
          if let newRate = newRate, let lastPriceNumber = lastPriceNumber, API.getLastSelectedCurrency() == userPreferredCurrency {
            self.lastPriceNumber = newRate
            
            if newRate.doubleValue > lastPriceNumber.doubleValue  {
              self.lastPriceArrowImage.image = UIImage(systemName: "arrow.up")
              self.setLastPriceOutletsHidden(isHidden: false)
            } else if newRate.doubleValue == lastPriceNumber.doubleValue {
              self.setLastPriceOutletsHidden(isHidden: true)
            } else {
              self.lastPriceArrowImage.image = UIImage(systemName: "arrow.down")
              self.setLastPriceOutletsHidden(isHidden: false)
            }
          } else {
            self.setLastPriceOutletsHidden(isHidden: true)
          }
        
          TodayData.savePriceRateAndLastUpdate(rate: todayStore.rate, lastUpdate: todayStore.lastUpdate)
          API.saveNewSelectedCurrency()
          completionHandler(.newData)
        }
      }
    })
  }
  
}
