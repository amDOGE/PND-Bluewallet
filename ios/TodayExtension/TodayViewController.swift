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
  }
  
  func widgetPerformUpdate(completionHandler: (@escaping (NCUpdateResult) -> Void)) {
    // Perform any setup necessary in order to update the view.
    
    // If an error is encountered, use NCUpdateResult.Failed
    // If there's no update required, use NCUpdateResult.NoData
    // If there's an update, use NCUpdateResult.NewData
    
    API.fetchPrice(completion: { (result) in
      DispatchQueue.main.async { [weak self] in
        guard let rateString = result.bpi?.uSD?.rate,
          let lastUpdatedString = result.time?.updatedISO
          else {
            return
        }
        
        if let rateNumber = self?.numberFormatter.number(from: rateString) {
          self?.numberFormatter.numberStyle = .currency
          self?.priceLabel.text  = self?.numberFormatter.string(from: rateNumber)
        }
        
        if let dateFormatted = self?.isoDateFormatter.date(from: lastUpdatedString) {
          self?.lastUpdatedDate.text = self?.dateFormatter.string(from: dateFormatted)
        }
        
        completionHandler(NCUpdateResult.newData)
      }
    })
  }
  
}
