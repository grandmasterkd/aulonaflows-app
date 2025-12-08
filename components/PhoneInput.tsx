"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Country {
  code: string
  name: string
  flag: string
  dialCode: string
}

const countries: Country[] = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44" },
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dialCode: "+39" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dialCode: "+34" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dialCode: "+31" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", dialCode: "+32" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", dialCode: "+41" },
  { code: "AT", name: "Austria", flag: "🇦🇹", dialCode: "+43" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", dialCode: "+46" },
  { code: "NO", name: "Norway", flag: "🇳🇴", dialCode: "+47" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", dialCode: "+45" },
  { code: "FI", name: "Finland", flag: "🇫🇮", dialCode: "+358" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", dialCode: "+353" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dialCode: "+351" },
  { code: "GR", name: "Greece", flag: "🇬🇷", dialCode: "+30" },
  { code: "PL", name: "Poland", flag: "🇵🇱", dialCode: "+48" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", dialCode: "+420" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", dialCode: "+36" },
  { code: "RO", name: "Romania", flag: "🇷🇴", dialCode: "+40" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", dialCode: "+421" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮", dialCode: "+386" },
  { code: "HR", name: "Croatia", flag: "🇭🇷", dialCode: "+385" },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦", dialCode: "+387" },
  { code: "RS", name: "Serbia", flag: "🇷🇸", dialCode: "+381" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪", dialCode: "+382" },
  { code: "MK", name: "North Macedonia", flag: "🇲🇰", dialCode: "+389" },
  { code: "AL", name: "Albania", flag: "🇦🇱", dialCode: "+355" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", dialCode: "+359" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", dialCode: "+90" },
  { code: "RU", name: "Russia", flag: "🇷🇺", dialCode: "+7" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", dialCode: "+380" },
  { code: "BY", name: "Belarus", flag: "🇧🇾", dialCode: "+375" },
  { code: "MD", name: "Moldova", flag: "🇲🇩", dialCode: "+373" },
  { code: "GE", name: "Georgia", flag: "🇬🇪", dialCode: "+995" },
  { code: "AM", name: "Armenia", flag: "🇦🇲", dialCode: "+374" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿", dialCode: "+994" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", dialCode: "+7" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", dialCode: "+998" },
  { code: "TM", name: "Turkmenistan", flag: "🇹🇲", dialCode: "+993" },
  { code: "TJ", name: "Tajikistan", flag: "🇹🇯", dialCode: "+992" },
  { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬", dialCode: "+996" },
  { code: "CN", name: "China", flag: "🇨🇳", dialCode: "+86" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dialCode: "+81" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dialCode: "+82" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dialCode: "+880" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", dialCode: "+94" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", dialCode: "+977" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", dialCode: "+66" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dialCode: "+84" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dialCode: "+60" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dialCode: "+65" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dialCode: "+62" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", dialCode: "+63" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", dialCode: "+852" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", dialCode: "+886" },
  { code: "MO", name: "Macau", flag: "🇲🇴", dialCode: "+853" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳", dialCode: "+976" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭", dialCode: "+855" },
  { code: "LA", name: "Laos", flag: "🇱🇦", dialCode: "+856" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", dialCode: "+95" },
  { code: "BN", name: "Brunei", flag: "🇧🇳", dialCode: "+673" },
  { code: "BT", name: "Bhutan", flag: "🇧🇹", dialCode: "+975" },
  { code: "MV", name: "Maldives", flag: "🇲🇻", dialCode: "+960" },
  { code: "AF", name: "Afghanistan", flag: "🇦🇫", dialCode: "+93" },
  { code: "IR", name: "Iran", flag: "🇮🇷", dialCode: "+98" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", dialCode: "+964" },
  { code: "SY", name: "Syria", flag: "🇸🇾", dialCode: "+963" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", dialCode: "+961" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", dialCode: "+962" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966" },
  { code: "YE", name: "Yemen", flag: "🇾🇪", dialCode: "+967" },
  { code: "OM", name: "Oman", flag: "🇴🇲", dialCode: "+968" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dialCode: "+971" },
  { code: "IL", name: "Israel", flag: "🇮🇱", dialCode: "+972" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dialCode: "+965" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", dialCode: "+973" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", dialCode: "+974" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", dialCode: "+20" },
  { code: "LY", name: "Libya", flag: "🇱🇾", dialCode: "+218" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", dialCode: "+216" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", dialCode: "+213" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", dialCode: "+212" },
  { code: "SD", name: "Sudan", flag: "🇸🇩", dialCode: "+249" },
  { code: "SS", name: "South Sudan", flag: "🇸🇸", dialCode: "+211" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", dialCode: "+251" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", dialCode: "+254" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", dialCode: "+256" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", dialCode: "+255" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", dialCode: "+250" },
  { code: "BI", name: "Burundi", flag: "🇧🇮", dialCode: "+257" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", dialCode: "+258" },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", dialCode: "+260" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", dialCode: "+263" },
  { code: "BW", name: "Botswana", flag: "🇧🇼", dialCode: "+267" },
  { code: "NA", name: "Namibia", flag: "🇳🇦", dialCode: "+264" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dialCode: "+27" },
  { code: "LS", name: "Lesotho", flag: "🇱🇸", dialCode: "+266" },
  { code: "SZ", name: "Eswatini", flag: "🇸🇿", dialCode: "+268" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", dialCode: "+261" },
  { code: "MU", name: "Mauritius", flag: "🇲🇺", dialCode: "+230" },
  { code: "RE", name: "Réunion", flag: "🇷🇪", dialCode: "+262" },
  { code: "KM", name: "Comoros", flag: "🇰🇲", dialCode: "+269" },
  { code: "SC", name: "Seychelles", flag: "🇸🇨", dialCode: "+248" },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯", dialCode: "+253" },
  { code: "SO", name: "Somalia", flag: "🇸🇴", dialCode: "+252" },
  { code: "ER", name: "Eritrea", flag: "🇪🇷", dialCode: "+291" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233" },
  { code: "CI", name: "Ivory Coast", flag: "🇨🇮", dialCode: "+225" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", dialCode: "+221" },
  { code: "ML", name: "Mali", flag: "🇲🇱", dialCode: "+223" },
  { code: "GN", name: "Guinea", flag: "🇬🇳", dialCode: "+224" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", dialCode: "+226" },
  { code: "TG", name: "Togo", flag: "🇹🇬", dialCode: "+228" },
  { code: "BJ", name: "Benin", flag: "🇧🇯", dialCode: "+229" },
  { code: "NE", name: "Niger", flag: "🇳🇪", dialCode: "+227" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", dialCode: "+237" },
  { code: "TD", name: "Chad", flag: "🇹🇩", dialCode: "+235" },
  { code: "CF", name: "Central African Republic", flag: "🇨🇫", dialCode: "+236" },
  { code: "GQ", name: "Equatorial Guinea", flag: "🇬🇶", dialCode: "+240" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", dialCode: "+241" },
  { code: "CG", name: "Republic of the Congo", flag: "🇨🇬", dialCode: "+242" },
  { code: "CD", name: "Democratic Republic of the Congo", flag: "🇨🇩", dialCode: "+243" },
  { code: "AO", name: "Angola", flag: "🇦🇴", dialCode: "+244" },
  { code: "CV", name: "Cape Verde", flag: "🇨🇻", dialCode: "+238" },
  { code: "ST", name: "São Tomé and Príncipe", flag: "🇸🇹", dialCode: "+239" },
  { code: "GW", name: "Guinea-Bissau", flag: "🇬🇼", dialCode: "+245" },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱", dialCode: "+232" },
  { code: "LR", name: "Liberia", flag: "🇱🇷", dialCode: "+231" },
  { code: "GM", name: "Gambia", flag: "🇬🇲", dialCode: "+220" },
  { code: "MR", name: "Mauritania", flag: "🇲🇷", dialCode: "+222" },
  { code: "EH", name: "Western Sahara", flag: "🇪🇭", dialCode: "+212" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dialCode: "+55" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "+56" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dialCode: "+57" },
  { code: "PE", name: "Peru", flag: "🇵🇪", dialCode: "+51" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", dialCode: "+58" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", dialCode: "+593" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", dialCode: "+591" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", dialCode: "+595" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", dialCode: "+598" },
  { code: "GY", name: "Guyana", flag: "🇬🇾", dialCode: "+592" },
  { code: "SR", name: "Suriname", flag: "🇸🇷", dialCode: "+597" },
  { code: "GF", name: "French Guiana", flag: "🇬🇫", dialCode: "+594" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dialCode: "+52" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", dialCode: "+502" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", dialCode: "+504" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", dialCode: "+503" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", dialCode: "+505" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", dialCode: "+506" },
  { code: "PA", name: "Panama", flag: "🇵🇦", dialCode: "+507" },
  { code: "CU", name: "Cuba", flag: "🇨🇺", dialCode: "+53" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", dialCode: "+1" },
  { code: "HT", name: "Haiti", flag: "🇭🇹", dialCode: "+509" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴", dialCode: "+1" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷", dialCode: "+1" },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹", dialCode: "+1" },
  { code: "BB", name: "Barbados", flag: "🇧🇧", dialCode: "+1" },
  { code: "LC", name: "Saint Lucia", flag: "🇱🇨", dialCode: "+1" },
  { code: "VC", name: "Saint Vincent and the Grenadines", flag: "🇻🇨", dialCode: "+1" },
  { code: "GD", name: "Grenada", flag: "🇬🇩", dialCode: "+1" },
  { code: "AG", name: "Antigua and Barbuda", flag: "🇦🇬", dialCode: "+1" },
  { code: "KN", name: "Saint Kitts and Nevis", flag: "🇰🇳", dialCode: "+1" },
  { code: "DM", name: "Dominica", flag: "🇩🇲", dialCode: "+1" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸", dialCode: "+1" },
  { code: "BZ", name: "Belize", flag: "🇧🇿", dialCode: "+501" },
  { code: "KY", name: "Cayman Islands", flag: "🇰🇾", dialCode: "+1" },
  { code: "TC", name: "Turks and Caicos Islands", flag: "🇹🇨", dialCode: "+1" },
  { code: "VG", name: "British Virgin Islands", flag: "🇻🇬", dialCode: "+1" },
  { code: "VI", name: "U.S. Virgin Islands", flag: "🇻🇮", dialCode: "+1" },
  { code: "MS", name: "Montserrat", flag: "🇲🇸", dialCode: "+1" },
  { code: "AI", name: "Anguilla", flag: "🇦🇮", dialCode: "+1" },
  { code: "BM", name: "Bermuda", flag: "🇧🇲", dialCode: "+1" },
  { code: "GL", name: "Greenland", flag: "🇬🇱", dialCode: "+299" },
  { code: "IS", name: "Iceland", flag: "🇮🇸", dialCode: "+354" },
  { code: "FO", name: "Faroe Islands", flag: "🇫🇴", dialCode: "+298" },
  { code: "AX", name: "Åland Islands", flag: "🇦🇽", dialCode: "+358" },
  { code: "SJ", name: "Svalbard and Jan Mayen", flag: "🇸🇯", dialCode: "+47" },
  { code: "GG", name: "Guernsey", flag: "🇬🇬", dialCode: "+44" },
  { code: "JE", name: "Jersey", flag: "🇯🇪", dialCode: "+44" },
  { code: "IM", name: "Isle of Man", flag: "🇮🇲", dialCode: "+44" },
  { code: "GI", name: "Gibraltar", flag: "🇬🇮", dialCode: "+350" },
  { code: "MT", name: "Malta", flag: "🇲🇹", dialCode: "+356" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾", dialCode: "+357" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", dialCode: "+352" },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮", dialCode: "+423" },
  { code: "MC", name: "Monaco", flag: "🇲🇨", dialCode: "+377" },
  { code: "SM", name: "San Marino", flag: "🇸🇲", dialCode: "+378" },
  { code: "VA", name: "Vatican City", flag: "🇻🇦", dialCode: "+39" },
  { code: "AD", name: "Andorra", flag: "🇦🇩", dialCode: "+376" },
  { code: "EE", name: "Estonia", flag: "🇪🇪", dialCode: "+372" },
  { code: "LV", name: "Latvia", flag: "🇱🇻", dialCode: "+371" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹", dialCode: "+370" },
  { code: "BY", name: "Belarus", flag: "🇧🇾", dialCode: "+375" },
  { code: "MD", name: "Moldova", flag: "🇲🇩", dialCode: "+373" },
  { code: "GE", name: "Georgia", flag: "🇬🇪", dialCode: "+995" },
  { code: "AM", name: "Armenia", flag: "🇦🇲", dialCode: "+374" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿", dialCode: "+994" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", dialCode: "+7" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", dialCode: "+998" },
  { code: "TM", name: "Turkmenistan", flag: "🇹🇲", dialCode: "+993" },
  { code: "TJ", name: "Tajikistan", flag: "🇹🇯", dialCode: "+992" },
  { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬", dialCode: "+996" },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string, isValid: boolean) => void
  required?: boolean
  className?: string
}

export function PhoneInput({ value, onChange, required, className }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === "GB") || countries[0]
  )
  const [phoneNumber, setPhoneNumber] = useState("")

  // Parse initial value if provided
  useEffect(() => {
    if (value) {
      const found = countries.find(c => value.startsWith(c.dialCode))
      if (found) {
        setSelectedCountry(found)
        const num = value.slice(found.dialCode.length)
        setPhoneNumber(formatPhoneNumber(num))
      } else {
        setPhoneNumber(formatPhoneNumber(value))
      }
    }
  }, [value])

  const formatPhoneNumber = (num: string): string => {
    const digits = num.replace(/\D/g, '')
    if (digits.length === 0) return ''
    // Basic formatting: add spaces every 3-4 digits for readability
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return digits.replace(/(\d{3})(\d+)/, '$1 $2')
    if (digits.length <= 10) return digits.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3')
    return digits.replace(/(\d{4})(\d{3})(\d{3})(\d*)/, '$1 $2 $3 $4').trim()
  }

  const validatePhone = (number: string): boolean => {
    if (!number) return !required
    const digitsOnly = number.replace(/\D/g, '')
    return digitsOnly.length >= 7 && digitsOnly.length <= 15
  }

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    if (country) {
      setSelectedCountry(country)
      const newValue = country.dialCode + phoneNumber
      const isValid = validatePhone(newValue)
      onChange(newValue, isValid)
    }
  }

  const handlePhoneChange = (number: string) => {
    // Prevent letters and invalid characters
    let cleaned = number.replace(/[^0-9]/g, '')
    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1)
    }
    const formatted = formatPhoneNumber(cleaned)
    setPhoneNumber(formatted)
    const newValue = selectedCountry.dialCode + cleaned
    const isValid = validatePhone(newValue)
    onChange(newValue, isValid)
  }

  return (
    <div className={`flex ${className}`}>
      <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-40 bg-gray-200 border-none rounded-l-xl rounded-r-none h-14">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.flag} {country.dialCode}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={phoneNumber}
        onChange={(e) => handlePhoneChange(e.target.value)}
        required={required}
        className="bg-gray-200 border-none rounded-r-xl rounded-l-none h-14 flex-1"
        placeholder="Phone number"
      />
    </div>
  )
}