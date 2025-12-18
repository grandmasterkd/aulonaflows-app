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
  { code: "AF", name: "Afghanistan", flag: "🇦🇫", dialCode: "+93" },
  { code: "AL", name: "Albania", flag: "🇦🇱", dialCode: "+355" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", dialCode: "+213" },
  { code: "AS", name: "American Samoa", flag: "🇦🇸", dialCode: "+1684" },
  { code: "AD", name: "Andorra", flag: "🇦🇩", dialCode: "+376" },
  { code: "AO", name: "Angola", flag: "🇦🇴", dialCode: "+244" },
  { code: "AI", name: "Anguilla", flag: "🇦🇮", dialCode: "+1264" },
  { code: "AQ", name: "Antarctica", flag: "🇦🇶", dialCode: "null" },
  { code: "AG", name: "Antigua and Barbuda", flag: "🇦🇬", dialCode: "+1268" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54" },
  { code: "AM", name: "Armenia", flag: "🇦🇲", dialCode: "+374" },
  { code: "AW", name: "Aruba", flag: "🇦🇼", dialCode: "+297" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61" },
  { code: "AT", name: "Austria", flag: "🇦🇹", dialCode: "+43" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿", dialCode: "+994" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸", dialCode: "+1242" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", dialCode: "+973" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dialCode: "+880" },
  { code: "BB", name: "Barbados", flag: "🇧🇧", dialCode: "+1246" },
  { code: "BY", name: "Belarus", flag: "🇧🇾", dialCode: "+375" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", dialCode: "+32" },
  { code: "BZ", name: "Belize", flag: "🇧🇿", dialCode: "+501" },
  { code: "BJ", name: "Benin", flag: "🇧🇯", dialCode: "+229" },
  { code: "BM", name: "Bermuda", flag: "🇧🇲", dialCode: "+1441" },
  { code: "BT", name: "Bhutan", flag: "🇧🇹", dialCode: "+975" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", dialCode: "+591" },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦", dialCode: "+387" },
  { code: "BW", name: "Botswana", flag: "🇧🇼", dialCode: "+267" },
  { code: "BV", name: "Bouvet Island", flag: "🇧🇻", dialCode: "+47" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dialCode: "+55" },
  { code: "IO", name: "British Indian Ocean Territory", flag: "🇮🇴", dialCode: "+246" },
  { code: "VG", name: "British Virgin Islands", flag: "🇻🇬", dialCode: "+1284" },
  { code: "BN", name: "Brunei", flag: "🇧🇳", dialCode: "+673" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", dialCode: "+359" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", dialCode: "+226" },
  { code: "BI", name: "Burundi", flag: "🇧🇮", dialCode: "+257" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭", dialCode: "+855" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", dialCode: "+237" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
  { code: "CV", name: "Cape Verde", flag: "🇨🇻", dialCode: "+238" },
  { code: "BQ", name: "Caribbean Netherlands", flag: "🇧🇶", dialCode: "+599" },
  { code: "KY", name: "Cayman Islands", flag: "🇰🇾", dialCode: "+1345" },
  { code: "CF", name: "Central African Republic", flag: "🇨🇫", dialCode: "+236" },
  { code: "TD", name: "Chad", flag: "🇹🇩", dialCode: "+235" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "+56" },
  { code: "CN", name: "China", flag: "🇨🇳", dialCode: "+86" },
  { code: "CX", name: "Christmas Island", flag: "🇨🇽", dialCode: "+61" },
  { code: "CC", name: "Cocos (Keeling) Islands", flag: "🇨🇨", dialCode: "+61" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dialCode: "+57" },
  { code: "KM", name: "Comoros", flag: "🇰🇲", dialCode: "+269" },
  { code: "CG", name: "Republic of the Congo", flag: "🇨🇬", dialCode: "+242" },
  { code: "CD", name: "DR Congo", flag: "🇨🇩", dialCode: "+243" },
  { code: "CK", name: "Cook Islands", flag: "🇨🇰", dialCode: "+682" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", dialCode: "+506" },
  { code: "CI", name: "Ivory Coast", flag: "🇨🇮", dialCode: "+225" },
  { code: "HR", name: "Croatia", flag: "🇭🇷", dialCode: "+385" },
  { code: "CU", name: "Cuba", flag: "🇨🇺", dialCode: "+53" },
  { code: "CW", name: "Curaçao", flag: "🇨🇼", dialCode: "+599" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾", dialCode: "+357" },
  { code: "CZ", name: "Czechia", flag: "🇨🇿", dialCode: "+420" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", dialCode: "+45" },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯", dialCode: "+253" },
  { code: "DM", name: "Dominica", flag: "🇩🇲", dialCode: "+1767" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴", dialCode: "+1809" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", dialCode: "+593" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", dialCode: "+20" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", dialCode: "+503" },
  { code: "GQ", name: "Equatorial Guinea", flag: "🇬🇶", dialCode: "+240" },
  { code: "ER", name: "Eritrea", flag: "🇪🇷", dialCode: "+291" },
  { code: "EE", name: "Estonia", flag: "🇪🇪", dialCode: "+372" },
  { code: "SZ", name: "Eswatini", flag: "🇸🇿", dialCode: "+268" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", dialCode: "+251" },
  { code: "FK", name: "Falkland Islands", flag: "🇫🇰", dialCode: "+500" },
  { code: "FO", name: "Faroe Islands", flag: "🇫🇴", dialCode: "+298" },
  { code: "FJ", name: "Fiji", flag: "🇫🇯", dialCode: "+679" },
  { code: "FI", name: "Finland", flag: "🇫🇮", dialCode: "+358" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33" },
  { code: "GF", name: "French Guiana", flag: "🇬🇫", dialCode: "+594" },
  { code: "PF", name: "French Polynesia", flag: "🇵🇫", dialCode: "+689" },
  { code: "TF", name: "French Southern and Antarctic Lands", flag: "🇹🇫", dialCode: "+262" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", dialCode: "+241" },
  { code: "GM", name: "Gambia", flag: "🇬🇲", dialCode: "+220" },
  { code: "GE", name: "Georgia", flag: "🇬🇪", dialCode: "+995" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233" },
  { code: "GI", name: "Gibraltar", flag: "🇬🇮", dialCode: "+350" },
  { code: "GR", name: "Greece", flag: "🇬🇷", dialCode: "+30" },
  { code: "GL", name: "Greenland", flag: "🇬🇱", dialCode: "+299" },
  { code: "GD", name: "Grenada", flag: "🇬🇩", dialCode: "+1473" },
  { code: "GP", name: "Guadeloupe", flag: "🇬🇵", dialCode: "+590" },
  { code: "GU", name: "Guam", flag: "🇬🇺", dialCode: "+1671" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", dialCode: "+502" },
  { code: "GG", name: "Guernsey", flag: "🇬🇬", dialCode: "+44" },
  { code: "GN", name: "Guinea", flag: "🇬🇳", dialCode: "+224" },
  { code: "GW", name: "Guinea-Bissau", flag: "🇬🇼", dialCode: "+245" },
  { code: "GY", name: "Guyana", flag: "🇬🇾", dialCode: "+592" },
  { code: "HT", name: "Haiti", flag: "🇭🇹", dialCode: "+509" },
  { code: "HM", name: "Heard Island and McDonald Islands", flag: "🇭🇲", dialCode: "null" },
  { code: "VA", name: "Vatican City", flag: "🇻🇦", dialCode: "+3906698" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", dialCode: "+504" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", dialCode: "+852" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", dialCode: "+36" },
  { code: "IS", name: "Iceland", flag: "🇮🇸", dialCode: "+354" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dialCode: "+62" },
  { code: "IR", name: "Iran", flag: "🇮🇷", dialCode: "+98" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", dialCode: "+964" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", dialCode: "+353" },
  { code: "IM", name: "Isle of Man", flag: "🇮🇲", dialCode: "+44" },
  { code: "IL", name: "Israel", flag: "🇮🇱", dialCode: "+972" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dialCode: "+39" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", dialCode: "+1876" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dialCode: "+81" },
  { code: "JE", name: "Jersey", flag: "🇯🇪", dialCode: "+44" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", dialCode: "+962" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", dialCode: "+76" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", dialCode: "+254" },
  { code: "KI", name: "Kiribati", flag: "🇰🇮", dialCode: "+686" },
  { code: "KP", name: "North Korea", flag: "🇰🇵", dialCode: "+850" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dialCode: "+82" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dialCode: "+965" },
  { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬", dialCode: "+996" },
  { code: "LA", name: "Laos", flag: "🇱🇦", dialCode: "+856" },
  { code: "LV", name: "Latvia", flag: "🇱🇻", dialCode: "+371" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", dialCode: "+961" },
  { code: "LS", name: "Lesotho", flag: "🇱🇸", dialCode: "+266" },
  { code: "LR", name: "Liberia", flag: "🇱🇷", dialCode: "+231" },
  { code: "LY", name: "Libya", flag: "🇱🇾", dialCode: "+218" },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮", dialCode: "+423" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹", dialCode: "+370" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", dialCode: "+352" },
  { code: "MO", name: "Macau", flag: "🇲🇴", dialCode: "+853" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", dialCode: "+261" },
  { code: "MW", name: "Malawi", flag: "🇲🇼", dialCode: "+265" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dialCode: "+60" },
  { code: "MV", name: "Maldives", flag: "🇲🇻", dialCode: "+960" },
  { code: "ML", name: "Mali", flag: "🇲🇱", dialCode: "+223" },
  { code: "MT", name: "Malta", flag: "🇲🇹", dialCode: "+356" },
  { code: "MH", name: "Marshall Islands", flag: "🇲🇭", dialCode: "+692" },
  { code: "MQ", name: "Martinique", flag: "🇲🇶", dialCode: "+596" },
  { code: "MR", name: "Mauritania", flag: "🇲🇷", dialCode: "+222" },
  { code: "MU", name: "Mauritius", flag: "🇲🇺", dialCode: "+230" },
  { code: "YT", name: "Mayotte", flag: "🇾🇹", dialCode: "+262" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dialCode: "+52" },
  { code: "FM", name: "Micronesia", flag: "🇫🇲", dialCode: "+691" },
  { code: "MD", name: "Moldova", flag: "🇲🇩", dialCode: "+373" },
  { code: "MC", name: "Monaco", flag: "🇲🇨", dialCode: "+377" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳", dialCode: "+976" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪", dialCode: "+382" },
  { code: "MS", name: "Montserrat", flag: "🇲🇸", dialCode: "+1664" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", dialCode: "+212" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", dialCode: "+258" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", dialCode: "+95" },
  { code: "NA", name: "Namibia", flag: "🇳🇦", dialCode: "+264" },
  { code: "NR", name: "Nauru", flag: "🇳🇷", dialCode: "+674" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", dialCode: "+977" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dialCode: "+31" },
  { code: "NC", name: "New Caledonia", flag: "🇳🇨", dialCode: "+687" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", dialCode: "+64" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", dialCode: "+505" },
  { code: "NE", name: "Niger", flag: "🇳🇪", dialCode: "+227" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234" },
  { code: "NU", name: "Niue", flag: "🇳🇺", dialCode: "+683" },
  { code: "NF", name: "Norfolk Island", flag: "🇳🇫", dialCode: "+672" },
  { code: "MK", name: "North Macedonia", flag: "🇲🇰", dialCode: "+389" },
  { code: "MP", name: "Northern Mariana Islands", flag: "🇲🇵", dialCode: "+1670" },
  { code: "NO", name: "Norway", flag: "🇳🇴", dialCode: "+47" },
  { code: "OM", name: "Oman", flag: "🇴🇲", dialCode: "+968" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92" },
  { code: "PW", name: "Palau", flag: "🇵🇼", dialCode: "+680" },
  { code: "PS", name: "Palestine", flag: "🇵🇸", dialCode: "+970" },
  { code: "PA", name: "Panama", flag: "🇵🇦", dialCode: "+507" },
  { code: "PG", name: "Papua New Guinea", flag: "🇵🇬", dialCode: "+675" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", dialCode: "+595" },
  { code: "PE", name: "Peru", flag: "🇵🇪", dialCode: "+51" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", dialCode: "+63" },
  { code: "PN", name: "Pitcairn Islands", flag: "🇵🇳", dialCode: "+64" },
  { code: "PL", name: "Poland", flag: "🇵🇱", dialCode: "+48" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dialCode: "+351" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷", dialCode: "+1787" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", dialCode: "+974" },
  { code: "RE", name: "Réunion", flag: "🇷🇪", dialCode: "+262" },
  { code: "RO", name: "Romania", flag: "🇷🇴", dialCode: "+40" },
  { code: "RU", name: "Russia", flag: "🇷🇺", dialCode: "+73" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", dialCode: "+250" },
  { code: "BL", name: "Saint Barthélemy", flag: "🇧🇱", dialCode: "+590" },
  { code: "SH", name: "Saint Helena, Ascension and Tristan da Cunha", flag: "🇸🇭", dialCode: "+290" },
  { code: "KN", name: "Saint Kitts and Nevis", flag: "🇰🇳", dialCode: "+1869" },
  { code: "LC", name: "Saint Lucia", flag: "🇱🇨", dialCode: "+1758" },
  { code: "MF", name: "Saint Martin", flag: "🇲🇫", dialCode: "+590" },
  { code: "PM", name: "Saint Pierre and Miquelon", flag: "🇵🇲", dialCode: "+508" },
  { code: "VC", name: "Saint Vincent and the Grenadines", flag: "🇻🇨", dialCode: "+1784" },
  { code: "WS", name: "Samoa", flag: "🇼🇸", dialCode: "+685" },
  { code: "SM", name: "San Marino", flag: "🇸🇲", dialCode: "+378" },
  { code: "ST", name: "São Tomé and Príncipe", flag: "🇸🇹", dialCode: "+239" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", dialCode: "+221" },
  { code: "RS", name: "Serbia", flag: "🇷🇸", dialCode: "+381" },
  { code: "SC", name: "Seychelles", flag: "🇸🇨", dialCode: "+248" },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱", dialCode: "+232" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dialCode: "+65" },
  { code: "SX", name: "Sint Maarten", flag: "🇸🇽", dialCode: "+1721" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", dialCode: "+421" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮", dialCode: "+386" },
  { code: "SB", name: "Solomon Islands", flag: "🇸🇧", dialCode: "+677" },
  { code: "SO", name: "Somalia", flag: "🇸🇴", dialCode: "+252" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dialCode: "+27" },
  { code: "GS", name: "South Georgia", flag: "🇬🇸", dialCode: "+500" },
  { code: "SS", name: "South Sudan", flag: "🇸🇸", dialCode: "+211" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dialCode: "+34" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", dialCode: "+94" },
  { code: "SD", name: "Sudan", flag: "🇸🇩", dialCode: "+249" },
  { code: "SR", name: "Suriname", flag: "🇸🇷", dialCode: "+597" },
  { code: "SJ", name: "Svalbard and Jan Mayen", flag: "🇸🇯", dialCode: "+4779" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", dialCode: "+46" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", dialCode: "+41" },
  { code: "SY", name: "Syria", flag: "🇸🇾", dialCode: "+963" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", dialCode: "+886" },
  { code: "TJ", name: "Tajikistan", flag: "🇹🇯", dialCode: "+992" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", dialCode: "+255" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", dialCode: "+66" },
  { code: "TL", name: "Timor-Leste", flag: "🇹🇱", dialCode: "+670" },
  { code: "TG", name: "Togo", flag: "🇹🇬", dialCode: "+228" },
  { code: "TK", name: "Tokelau", flag: "🇹🇰", dialCode: "+690" },
  { code: "TO", name: "Tonga", flag: "🇹🇴", dialCode: "+676" },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹", dialCode: "+1868" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", dialCode: "+216" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", dialCode: "+90" },
  { code: "TM", name: "Turkmenistan", flag: "🇹🇲", dialCode: "+993" },
  { code: "TC", name: "Turks and Caicos Islands", flag: "🇹🇨", dialCode: "+1649" },
  { code: "TV", name: "Tuvalu", flag: "🇹🇻", dialCode: "+688" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", dialCode: "+256" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", dialCode: "+380" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dialCode: "+971" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44" },
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1201" },
  { code: "UM", name: "United States Minor Outlying Islands", flag: "🇺🇲", dialCode: "+268" },
  { code: "VI", name: "United States Virgin Islands", flag: "🇻🇮", dialCode: "+1340" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", dialCode: "+598" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", dialCode: "+998" },
  { code: "VU", name: "Vanuatu", flag: "🇻🇺", dialCode: "+678" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", dialCode: "+58" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dialCode: "+84" },
  { code: "WF", name: "Wallis and Futuna", flag: "🇼🇫", dialCode: "+681" },
  { code: "EH", name: "Western Sahara", flag: "🇪🇭", dialCode: "+2125288" },
  { code: "YE", name: "Yemen", flag: "🇾🇪", dialCode: "+967" },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", dialCode: "+260" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", dialCode: "+263" },
  { code: "AX", name: "Åland Islands", flag: "🇦🇽", dialCode: "+35818" }
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
          { selectedCountry.flag + " " } { selectedCountry.dialCode }
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.flag} {country.name}
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