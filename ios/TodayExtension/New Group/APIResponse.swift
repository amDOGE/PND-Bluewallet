import Foundation

struct APIResponse : Codable {
	let time : Time?
	let disclaimer : String?
	let bpi : Bpi?

	enum CodingKeys: String, CodingKey {
		case time = "time"
		case disclaimer = "disclaimer"
		case bpi = "bpi"
	}

	init(from decoder: Decoder) throws {
		let values = try decoder.container(keyedBy: CodingKeys.self)
		time = try values.decodeIfPresent(Time.self, forKey: .time)
		disclaimer = try values.decodeIfPresent(String.self, forKey: .disclaimer)
		bpi = try values.decodeIfPresent(Bpi.self, forKey: .bpi)
	}

}

struct USD : Codable {
  let code : String?
  let rate : String?
  let description : String?
  let rate_float : Double?

  enum CodingKeys: String, CodingKey {

    case code = "code"
    case rate = "rate"
    case description = "description"
    case rate_float = "rate_float"
  }

  init(from decoder: Decoder) throws {
    let values = try decoder.container(keyedBy: CodingKeys.self)
    code = try values.decodeIfPresent(String.self, forKey: .code)
    rate = try values.decodeIfPresent(String.self, forKey: .rate)
    description = try values.decodeIfPresent(String.self, forKey: .description)
    rate_float = try values.decodeIfPresent(Double.self, forKey: .rate_float)
  }

}

struct Time : Codable {
  let updated : String?
  let updatedISO : String?
  let updateduk : String?

  enum CodingKeys: String, CodingKey {

    case updated = "updated"
    case updatedISO = "updatedISO"
    case updateduk = "updateduk"
  }

  init(from decoder: Decoder) throws {
    let values = try decoder.container(keyedBy: CodingKeys.self)
    updated = try values.decodeIfPresent(String.self, forKey: .updated)
    updatedISO = try values.decodeIfPresent(String.self, forKey: .updatedISO)
    updateduk = try values.decodeIfPresent(String.self, forKey: .updateduk)
  }

}

struct Bpi : Codable {
  let uSD : USD?

  enum CodingKeys: String, CodingKey {

    case uSD = "USD"
  }

  init(from decoder: Decoder) throws {
    let values = try decoder.container(keyedBy: CodingKeys.self)
    uSD = try values.decodeIfPresent(USD.self, forKey: .uSD)
  }

}
