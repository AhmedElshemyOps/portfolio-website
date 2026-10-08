/* Amsterdam public references. Unknown costs remain null; private rates never belong here. */
(function (root) {
  "use strict";
  const attractions = [
    {
      id: "rijksmuseum",
      name: "Rijksmuseum",
      type: "Museum",
      defaultDuration: 120,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 25,
      child: null,
      infant: null,
      ageBands: [
        {
          min: 0,
          max: 18,
          price: 0,
        },
        {
          min: 19,
          max: 120,
          price: 25,
        },
      ],
      timedEntry: true,
      centreWalk: false,
      note: "Timed start normally required, including free admission. Group booking in advance; confirm guide access. Rebooking is subject to availability.",
      reference: {
        source:
          "https://www.rijksmuseum.nl/en/visit/practical-info/opening-hours-and-prices",
        hoursSource:
          "https://www.rijksmuseum.nl/en/visit/practical-info/opening-hours-and-prices",
        termsSource:
          "https://www.rijksmuseum.nl/en/visit/practical-info/opening-hours-and-prices",
        checked: "2026-10-08",
        basis: "Official public reference; supplier confirmation pending",
        price:
          "EUR 25 public adult reference; age bands below. Not a supplier net rate.",
        hours: "Daily 09:00–17:00.",
        terms:
          "Timed start normally required, including free admission. Group booking in advance; confirm guide access. Rebooking is subject to availability.",
      },
    },
    {
      id: "anne-frank",
      name: "Anne Frank House · museum admission",
      type: "Museum",
      defaultDuration: 90,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 16.5,
      child: null,
      infant: null,
      ageBands: [
        {
          min: 0,
          max: 9,
          price: 1,
        },
        {
          min: 10,
          max: 17,
          price: 7,
        },
        {
          min: 18,
          max: 120,
          price: 16.5,
        },
      ],
      timedEntry: true,
      centreWalk: false,
      note: "Official online timed tickets only. Tickets are non-refundable, non-transferable and cannot be exchanged. Weekly release for visits six weeks later. Steep stairs; review accessibility.",
      reference: {
        source: "https://www.annefrank.org/en/museum/tickets/",
        hoursSource: "https://www.annefrank.org/en/museum/tickets/",
        termsSource: "https://www.annefrank.org/en/museum/tickets/",
        checked: "2026-10-08",
        basis: "Official public reference; supplier confirmation pending",
        price:
          "EUR 16.5 public adult reference; age bands below. Not a supplier net rate.",
        hours: "Normally daily 09:00–22:00; check holiday and date exceptions.",
        terms:
          "Official online timed tickets only. Tickets are non-refundable, non-transferable and cannot be exchanged. Weekly release for visits six weeks later. Steep stairs; review accessibility.",
      },
    },
    {
      id: "nemo",
      name: "NEMO Science Museum",
      type: "Family / science",
      defaultDuration: 150,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 21.5,
      child: null,
      infant: null,
      ageBands: [
        {
          min: 0,
          max: 3,
          price: 0,
        },
        {
          min: 4,
          max: 120,
          price: 21.5,
        },
      ],
      timedEntry: true,
      centreWalk: false,
      note: "Timed start required. School/group bookings and tour-operator arrangements need separate confirmation.",
      reference: {
        source: "https://www.nemosciencemuseum.nl/en/plan-your-visit",
        hoursSource: "https://www.nemosciencemuseum.nl/en/plan-your-visit",
        termsSource: "https://www.nemosciencemuseum.nl/en/plan-your-visit",
        checked: "2026-10-08",
        basis: "Official public reference; supplier confirmation pending",
        price:
          "EUR 21.5 public adult reference; age bands below. Not a supplier net rate.",
        hours:
          "Normally Tue–Sun 10:00–17:30; Monday opening varies by season and holidays.",
        terms:
          "Timed start required. School/group bookings and tour-operator arrangements need separate confirmation.",
      },
    },
    {
      id: "artis",
      name: "ARTIS Zoo",
      type: "Family / nature",
      defaultDuration: 180,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 32.5,
      child: null,
      infant: null,
      ageBands: [
        {
          min: 0,
          max: 2,
          price: 0,
        },
        {
          min: 3,
          max: 12,
          price: 27.5,
        },
        {
          min: 13,
          max: 120,
          price: 32.5,
        },
      ],
      timedEntry: true,
      centreWalk: false,
      note: "Public counter-price planning basis. Online from-rates vary by day: adult 13+ from EUR 29.50, ages 3–12 from EUR 25.50. Confirm chosen date/product; no discount inferred.",
      reference: {
        source: "https://www.artis.nl/en/plan-your-visit",
        hoursSource: "https://www.artis.nl/en/plan-your-visit",
        termsSource: "https://www.artis.nl/en/plan-your-visit",
        checked: "2026-10-08",
        basis: "Official public reference; supplier confirmation pending",
        price:
          "EUR 32.5 public adult reference; age bands below. Not a supplier net rate.",
        hours: "Normally daily 09:00–18:00; holiday exceptions.",
        terms:
          "Public counter-price planning basis. Online from-rates vary by day: adult 13+ from EUR 29.50, ages 3–12 from EUR 25.50. Confirm chosen date/product; no discount inferred.",
      },
    },
    {
      id: "micropia",
      name: "ARTIS-Micropia",
      type: "Museum / science",
      defaultDuration: 90,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 18,
      child: null,
      infant: null,
      ageBands: [
        {
          min: 0,
          max: 12,
          price: 0,
        },
        {
          min: 13,
          max: 120,
          price: 18,
        },
      ],
      timedEntry: true,
      centreWalk: false,
      note: "Counter-price planning basis; online from EUR 17 varies by day. Check current product and group conditions.",
      reference: {
        source: "https://www.artis.nl/en/plan-your-visit",
        hoursSource: "https://www.artis.nl/en/plan-your-visit",
        termsSource: "https://www.artis.nl/en/plan-your-visit",
        checked: "2026-10-08",
        basis: "Official public reference; supplier confirmation pending",
        price:
          "EUR 18 public adult reference; age bands below. Not a supplier net rate.",
        hours: "Normally daily 10:00–17:00.",
        terms:
          "Counter-price planning basis; online from EUR 17 varies by day. Check current product and group conditions.",
      },
    },
    {
      id: "groote-museum",
      name: "ARTIS-Groote Museum",
      type: "Museum",
      defaultDuration: 90,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 18,
      child: null,
      infant: null,
      ageBands: [
        {
          min: 0,
          max: 12,
          price: 0,
        },
        {
          min: 13,
          max: 120,
          price: 18,
        },
      ],
      timedEntry: true,
      centreWalk: false,
      note: "Counter-price planning basis; online from EUR 17 varies by day. Check current product and group conditions.",
      reference: {
        source: "https://www.artis.nl/en/plan-your-visit",
        hoursSource: "https://www.artis.nl/en/plan-your-visit",
        termsSource: "https://www.artis.nl/en/plan-your-visit",
        checked: "2026-10-08",
        basis: "Official public reference; supplier confirmation pending",
        price:
          "EUR 18 public adult reference; age bands below. Not a supplier net rate.",
        hours: "Normally daily 10:00–17:00; Thursdays until 22:00.",
        terms:
          "Counter-price planning basis; online from EUR 17 varies by day. Check current product and group conditions.",
      },
    },
    {
      id: "maritime",
      name: "National Maritime Museum",
      type: "Museum",
      defaultDuration: 120,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 20,
      child: null,
      infant: null,
      ageBands: [
        {
          min: 0,
          max: 4,
          price: 0,
        },
        {
          min: 5,
          max: 17,
          price: 8.5,
        },
        {
          min: 18,
          max: 120,
          price: 20,
        },
      ],
      timedEntry: true,
      centreWalk: false,
      note: "Groups must register/book ahead. Confirm visit conditions and accessible route; cashless payment.",
      reference: {
        source: "https://www.hetscheepvaartmuseum.nl/bezoek/openingstijden",
        hoursSource:
          "https://www.hetscheepvaartmuseum.nl/bezoek/openingstijden",
        termsSource:
          "https://www.hetscheepvaartmuseum.nl/bezoek/openingstijden",
        checked: "2026-10-08",
        basis: "Official public reference; supplier confirmation pending",
        price:
          "EUR 20 public adult reference; age bands below. Not a supplier net rate.",
        hours: "Daily 10:00–17:00; closed 1 January, 27 April and 25 December.",
        terms:
          "Groups must register/book ahead. Confirm visit conditions and accessible route; cashless payment.",
      },
    },
    {
      id: "rembrandt-house",
      name: "Rembrandt House Museum",
      type: "Museum",
      defaultDuration: 90,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 23.5,
      child: null,
      infant: null,
      ageBands: [
        {
          min: 0,
          max: 5,
          price: 0,
        },
        {
          min: 6,
          max: 17,
          price: 8,
        },
        {
          min: 18,
          max: 25,
          price: 15,
        },
        {
          min: 26,
          max: 120,
          price: 23.5,
        },
      ],
      timedEntry: true,
      centreWalk: false,
      note: "Standard 2026 rates; eligible youth 18–25 rate EUR 15. Off-peak products priced separately. Paid tickets cannot be cancelled; free rebooking via ticket partner. Group reservation separately.",
      reference: {
        source:
          "https://www.rembrandthuis.nl/en/plan-your-visit/visitor-information/opening-hours-fees/",
        hoursSource:
          "https://www.rembrandthuis.nl/en/plan-your-visit/visitor-information/opening-hours-fees/",
        termsSource:
          "https://www.rembrandthuis.nl/en/plan-your-visit/visitor-information/opening-hours-fees/",
        checked: "2026-10-08",
        basis: "Official public reference; supplier confirmation pending",
        price:
          "EUR 23.5 public adult reference; age bands below. Not a supplier net rate.",
        hours:
          "Opens 10:00; seasonal closing 17:00 or 18:00; check exceptions.",
        terms:
          "Standard 2026 rates; eligible youth 18–25 rate EUR 15. Off-peak products priced separately. Paid tickets cannot be cancelled; free rebooking via ticket partner. Group reservation separately.",
      },
    },
    {
      id: "adam-lookout",
      name: "A’DAM LOOKOUT · admission only",
      type: "Observation deck",
      defaultDuration: 75,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 16.5,
      child: null,
      infant: null,
      ageBands: [
        {
          min: 4,
          max: 12,
          price: 10.5,
        },
        {
          min: 13,
          max: 120,
          price: 16.5,
        },
      ],
      timedEntry: true,
      centreWalk: false,
      note: "Online admission only; swing and VR excluded. Under-four price pending. Group rates from 15 require separate booking; swing/VR minimum height 1.20 m.",
      reference: {
        source: "https://www.adamlookout.com/tickets/",
        hoursSource: "https://www.adamlookout.com/tickets/",
        termsSource: "https://www.adamlookout.com/tickets/",
        checked: "2026-10-08",
        basis: "Official public reference; supplier confirmation pending",
        price:
          "EUR 16.5 public adult reference; age bands below. Not a supplier net rate.",
        hours: "Daily 10:00–22:00; last entrance 21:00.",
        terms:
          "Online admission only; swing and VR excluded. Under-four price pending. Group rates from 15 require separate booking; swing/VR minimum height 1.20 m.",
      },
    },
    {
      id: "van-gogh",
      name: "Van Gogh Museum",
      type: "Museum",
      defaultDuration: 120,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 25,
      child: null,
      infant: null,
      ageBands: [
        { min: 0, max: 17, price: 0 },
        { min: 18, max: 120, price: 25 },
      ],
      timedEntry: true,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://tickets.vangoghmuseum.nl/en/tickets",
        hoursSource: "https://tickets.vangoghmuseum.nl/en/tickets",
        termsSource: "https://tickets.vangoghmuseum.nl/en/tickets",
        checked: "2026-10-08",
        basis:
          "Dated public admission reference; availability and supplier confirmation pending",
        price:
          "Adult EUR 25; under 18 free. Optional audio guides and eligibility discounts excluded.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Every visitor needs a dated, timed ticket, including free admission. Tickets are non-refundable. Groups must use the group booking route; individual tickets are not valid for group bookings.",
      },
    },
    {
      id: "stedelijk",
      name: "Stedelijk Museum",
      type: "Museum",
      defaultDuration: 120,
      ticketRequired: true,
      verification: "Pending verification",
      adult: null,
      child: null,
      infant: null,
      ageBands: [],
      timedEntry: true,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://www.stedelijk.nl/en/visit",
        hoursSource: "https://www.stedelijk.nl/en/visit",
        termsSource: "https://www.stedelijk.nl/en/visit",
        checked: "",
        basis: "Research candidate; current product and price pending",
        price:
          "Price not confirmed. Enter the selected product rate; blank does not mean free.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Review current booking, group, amendment and cancellation conditions before confirmation.",
      },
    },
    {
      id: "moco",
      name: "Moco Museum Amsterdam",
      type: "Museum",
      defaultDuration: 90,
      ticketRequired: true,
      verification: "Pending verification",
      adult: null,
      child: null,
      infant: null,
      ageBands: [],
      timedEntry: true,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://www.mocomuseum.com/",
        hoursSource: "https://www.mocomuseum.com/",
        termsSource: "https://www.mocomuseum.com/",
        checked: "",
        basis: "Research candidate; current product and price pending",
        price:
          "Price not confirmed. Enter the selected product rate; blank does not mean free.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Review current booking, group, amendment and cancellation conditions before confirmation.",
      },
    },
    {
      id: "hortus",
      name: "Hortus Botanicus Amsterdam",
      type: "Nature",
      defaultDuration: 90,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 14.75,
      child: null,
      infant: null,
      ageBands: [
        { min: 0, max: 4, price: 0 },
        { min: 5, max: 17, price: 8.5 },
        { min: 18, max: 120, price: 14.75 },
      ],
      timedEntry: false,
      centreWalk: false,
      closedMonthDays: ["01-01", "12-25"],
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://www.dehortus.nl/bezoek/",
        hoursSource: "https://www.dehortus.nl/bezoek/",
        termsSource: "https://www.dehortus.nl/bezoek/",
        checked: "2026-10-08",
        basis:
          "Dated public admission reference; availability and supplier confirmation pending",
        price:
          "Adult EUR 14.75; ages 5–17 EUR 8.50; ages 0–4 free, following the Dutch visitor page.",
        hours:
          "Daily 10:00–17:00; closed 1 January and 25 December. Confirm special-event exceptions.",
        terms:
          "Card payments only. Museumkaart is not accepted. Confirm group arrangements and current amendment/cancellation terms separately.",
      },
    },
    {
      id: "hart",
      name: "H’ART Museum",
      type: "Museum",
      defaultDuration: 120,
      ticketRequired: true,
      verification: "Pending verification",
      adult: null,
      child: null,
      infant: null,
      ageBands: [],
      timedEntry: true,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://www.hartmuseum.nl/",
        hoursSource: "https://www.hartmuseum.nl/",
        termsSource: "https://www.hartmuseum.nl/",
        checked: "",
        basis: "Research candidate; current product and price pending",
        price:
          "Price not confirmed. Enter the selected product rate; blank does not mean free.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Review current booking, group, amendment and cancellation conditions before confirmation.",
      },
    },
    {
      id: "resistance",
      name: "Dutch Resistance Museum",
      type: "Museum",
      defaultDuration: 90,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 17.5,
      child: null,
      infant: null,
      ageBands: [
        { min: 0, max: 6, price: 0 },
        { min: 7, max: 17, price: 9.5 },
        { min: 18, max: 120, price: 17.5 },
      ],
      timedEntry: false,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://www.verzetsmuseum.org/nl/tickets-en-prijzen",
        hoursSource: "https://www.verzetsmuseum.org/nl/tickets-en-prijzen",
        termsSource: "https://www.verzetsmuseum.org/nl/tickets-en-prijzen",
        checked: "2026-10-08",
        basis:
          "Dated public admission reference; availability and supplier confirmation pending",
        price:
          "Adult EUR 17.50; ages 7–17 EUR 9.50; ages 0–6 free. Standard admission includes an audio tour.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Tickets available online or on arrival. Family and card-holder products have separate eligibility. Confirm group and cancellation terms before booking.",
      },
    },
    {
      id: "jewish-museum",
      name: "Jewish Museum + Portuguese Synagogue · duoticket",
      type: "Museum",
      defaultDuration: 120,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 20,
      child: null,
      infant: null,
      ageBands: [
        { min: 0, max: 5, price: 0 },
        { min: 6, max: 12, price: 6 },
        { min: 13, max: 17, price: 8 },
        { min: 18, max: 120, price: 20 },
      ],
      timedEntry: true,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source:
          "https://ticket.jck.nl/nl/joods-museum-portugese-synagoge/tickets",
        hoursSource:
          "https://ticket.jck.nl/nl/joods-museum-portugese-synagoge/tickets",
        termsSource:
          "https://ticket.jck.nl/nl/joods-museum-portugese-synagoge/tickets",
        checked: "2026-10-08",
        basis:
          "Dated public admission reference; availability and supplier confirmation pending",
        price:
          "Online duoticket: adult EUR 20; ages 13–17 EUR 8; ages 6–12 EUR 6; ages 0–5 free. This is not the four-venue combiticket.",
        hours:
          "Normally 11:00–17:00; Portuguese Synagogue closed Saturdays and some Jewish holidays. Museum access is separate; check each venue.",
        terms:
          "Includes Jewish Museum/Junior and Portuguese Synagogue; valid one week from the selected date. Groups of eight or more must reserve through the group route. Review cancellation conditions separately.",
      },
    },
    {
      id: "eye",
      name: "Eye Filmmuseum · exhibition",
      type: "Museum",
      defaultDuration: 90,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 16.5,
      child: null,
      infant: null,
      ageBands: [
        { min: 0, max: 17, price: 0 },
        { min: 18, max: 120, price: 16.5 },
      ],
      timedEntry: false,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://www.eyefilm.nl/en/plan-your-visit",
        hoursSource: "https://www.eyefilm.nl/en/plan-your-visit",
        termsSource: "https://www.eyefilm.nl/en/plan-your-visit",
        checked: "2026-10-08",
        basis:
          "Dated public admission reference; availability and supplier confirmation pending",
        price:
          "Exhibition adult EUR 16.50; ages 0–17 free. Film tickets are a different product; temporary exhibitions may have supplements.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Purchased tickets cannot be exchanged or refunded. Card payments only. Groups above eight should register in advance; confirm the selected exhibition and any supplement.",
      },
    },
    {
      id: "foam",
      name: "Foam Photography Museum",
      type: "Museum",
      defaultDuration: 75,
      ticketRequired: true,
      verification: "Pending verification",
      adult: 16,
      child: null,
      infant: null,
      ageBands: [
        { min: 0, max: 12, price: 0 },
        { min: 13, max: 120, price: 16 },
      ],
      timedEntry: false,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://www.foam.org/visit",
        hoursSource: "https://www.foam.org/visit",
        termsSource: "https://www.foam.org/visit",
        checked: "2026-10-08",
        basis:
          "Dated public admission reference; availability and supplier confirmation pending",
        price:
          "Standard admission EUR 16; ages 0–12 free. Discounted student/CJP products require eligibility and are not a general youth rate.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Card payments only. Historic premises are not fully wheelchair accessible; confirm suitability with the venue. Review group and cancellation conditions before booking.",
      },
    },
    {
      id: "blue-boat",
      name: "Blue Boat · canal cruise",
      type: "Canal cruise",
      defaultDuration: 75,
      ticketRequired: true,
      verification: "Pending verification",
      adult: null,
      child: null,
      infant: null,
      ageBands: [],
      timedEntry: true,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://www.blueboat.nl/en/",
        hoursSource: "https://www.blueboat.nl/en/",
        termsSource: "https://www.blueboat.nl/en/",
        checked: "",
        basis: "Research candidate; current product and price pending",
        price:
          "Price not confirmed. Enter the selected product rate; blank does not mean free.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Review current booking, group, amendment and cancellation conditions before confirmation.",
      },
    },
    {
      id: "lovers",
      name: "LOVERS · canal cruise",
      type: "Canal cruise",
      defaultDuration: 75,
      ticketRequired: true,
      verification: "Pending verification",
      adult: null,
      child: null,
      infant: null,
      ageBands: [],
      timedEntry: true,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://www.lovers.nl/en/",
        hoursSource: "https://www.lovers.nl/en/",
        termsSource: "https://www.lovers.nl/en/",
        checked: "",
        basis: "Research candidate; current product and price pending",
        price:
          "Price not confirmed. Enter the selected product rate; blank does not mean free.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Review current booking, group, amendment and cancellation conditions before confirmation.",
      },
    },
    {
      id: "stromma",
      name: "Stromma · canal cruise",
      type: "Canal cruise",
      defaultDuration: 75,
      ticketRequired: true,
      verification: "Pending verification",
      adult: null,
      child: null,
      infant: null,
      ageBands: [],
      timedEntry: true,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://www.stromma.com/en-nl/amsterdam/",
        hoursSource: "https://www.stromma.com/en-nl/amsterdam/",
        termsSource: "https://www.stromma.com/en-nl/amsterdam/",
        checked: "",
        basis: "Research candidate; current product and price pending",
        price:
          "Price not confirmed. Enter the selected product rate; blank does not mean free.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Review current booking, group, amendment and cancellation conditions before confirmation.",
      },
    },
    {
      id: "this-is-holland",
      name: "THIS IS HOLLAND",
      type: "Experience",
      defaultDuration: 75,
      ticketRequired: true,
      verification: "Pending verification",
      adult: null,
      child: null,
      infant: null,
      ageBands: [],
      timedEntry: true,
      centreWalk: false,
      note: "Confirm selected product, visit date, group access, cancellation and accessibility with the operator.",
      reference: {
        source: "https://www.thisisholland.com/",
        hoursSource: "https://www.thisisholland.com/",
        termsSource: "https://www.thisisholland.com/",
        checked: "",
        basis: "Research candidate; current product and price pending",
        price:
          "Price not confirmed. Enter the selected product rate; blank does not mean free.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Review current booking, group, amendment and cancellation conditions before confirmation.",
      },
    },
    {
      id: "heineken",
      name: "Heineken Experience",
      type: "Experience",
      defaultDuration: 90,
      ticketRequired: true,
      verification: "Pending verification",
      adult: null,
      child: null,
      infant: null,
      ageBands: [],
      timedEntry: true,
      centreWalk: false,
      note: "Admission is strictly 18+, including accompanied guests. Current product price remains pending.",
      reference: {
        source: "https://www.heinekenexperience.com/",
        hoursSource: "https://www.heinekenexperience.com/",
        termsSource:
          "https://www.heinekenexperience.com/en/children-and-minors",
        checked: "",
        basis: "Research candidate; current product and price pending",
        price:
          "Price not confirmed. Enter the selected product rate; blank does not mean free.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Review current booking, group, amendment and cancellation conditions before confirmation.",
      },
    },
    {
      id: "centre-walk",
      name: "Historic centre / canal district · guided walk",
      type: "Walking route",
      defaultDuration: 90,
      ticketRequired: false,
      verification: "Not required",
      adult: 0,
      child: null,
      infant: null,
      ageBands: [],
      timedEntry: false,
      centreWalk: true,
      note: "No attraction admission included. City-centre guided tour rules apply: maximum 15 participants; groups above four need an exemption. Check route restrictions and 08:00–22:00 operating window.",
      reference: {
        source: "https://www.amsterdam.nl/en/business/rules-permit-tours/",
        hoursSource: "https://www.amsterdam.nl/en/business/rules-permit-tours/",
        termsSource: "https://www.amsterdam.nl/en/business/rules-permit-tours/",
        checked: "2026-10-08",
        basis: "Official public reference; supplier confirmation pending",
        price:
          "EUR 0 public adult reference; age bands below. Not a supplier net rate.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "No attraction admission included. City-centre guided tour rules apply: maximum 15 participants; groups above four need an exemption. Check route restrictions and 08:00–22:00 operating window.",
      },
    },
    {
      id: "anne-frank-exterior",
      name: "Anne Frank neighbourhood · exterior only",
      type: "Walking route",
      defaultDuration: 45,
      ticketRequired: false,
      verification: "Not required",
      adult: 0,
      child: null,
      infant: null,
      ageBands: [],
      timedEntry: false,
      centreWalk: true,
      note: "Exterior/neighbourhood walk only. Anne Frank House museum admission is excluded. Check city-centre guided-tour rules.",
      reference: {
        source: "https://www.amsterdam.nl/en/business/rules-permit-tours/",
        hoursSource: "https://www.amsterdam.nl/en/business/rules-permit-tours/",
        termsSource: "https://www.amsterdam.nl/en/business/rules-permit-tours/",
        checked: "2026-10-08",
        basis: "Official public reference; supplier confirmation pending",
        price:
          "EUR 0 public adult reference; age bands below. Not a supplier net rate.",
        hours: "Opening hours and exceptions require service-date review.",
        terms:
          "Exterior/neighbourhood walk only. Anne Frank House museum admission is excluded. Check city-centre guided-tour rules.",
      },
    },
  ];
  const city = {
    code: "AMS",
    name: "Amsterdam",
    country: "netherlands",
    baseCurrency: "EUR",
    sampleNotice:
      "Amsterdam: EUR costs. Public references are dated planning inputs, not live availability or supplier net rates. Unknown prices must be entered and reviewed.",
    attractions,
  };
  function ages(text) {
    if (!String(text || "").trim()) return [];
    return String(text)
      .split(",")
      .map((x) => x.trim())
      .map((x) => (/^\d+$/.test(x) ? Number(x) : NaN));
  }
  function tickets(stop, quote) {
    const count =
      Number(quote.adults) + Number(quote.children) + Number(quote.infants);
    const list = ages(quote.guestAges);
    if (stop.ageBands?.length) {
      if (
        list.length !== count ||
        list.some((a) => !Number.isInteger(a) || a < 0 || a > 120)
      )
        return {
          error:
            "Enter one age per guest, separated by commas, for age-based admission.",
        };
      const groups = [];
      for (const age of list) {
        const band = stop.ageBands.find((b) => age >= b.min && age <= b.max);
        if (!band || !Number.isFinite(band.price) || band.price < 0)
          return {
            error:
              "An age category has no confirmed public price. Add a reviewed ticket cost or use client-paid admission.",
          };
        let group = groups.find((g) => g.min === band.min);
        if (!group) {
          group = { ...band, quantity: 0 };
          groups.push(group);
        }
        group.quantity++;
      }
      return { groups };
    }
    const groups = [
      {
        min: 18,
        max: 120,
        price: stop.adultTicket,
        quantity: Number(quote.adults),
      },
      {
        min: 3,
        max: 17,
        price: stop.childTicket,
        quantity: Number(quote.children),
      },
      {
        min: 0,
        max: 2,
        price: stop.infantTicket,
        quantity: Number(quote.infants),
      },
    ].filter((g) => g.quantity);
    if (
      groups.some(
        (g) =>
          g.price === null ||
          g.price === "" ||
          !Number.isFinite(Number(g.price)) ||
          Number(g.price) < 0,
      )
    )
      return {
        error:
          "Selected ticket prices are missing. Enter date-specific costs or select client-paid admission.",
      };
    return { groups };
  }
  function checks(q, now = new Date()) {
    const blocking = [],
      warnings = [];
    const included = q.itinerary.filter((s) =>
      ["Included", "To be confirmed"].includes(s.status),
    );
    if (
      q.vatMode === "margin" &&
      q.pricingMethod === "margin" &&
      Number(q.targetMargin) * 1.21 >= 100
    )
      blocking.push(
        "Target margin is too high for the configured travel margin tax model.",
      );
    if (q.currency !== "EUR")
      blocking.push("Amsterdam quotations must use native EUR costs.");
    if (
      !q.taxReviewed ||
      !["exclusive", "inclusive", "margin", "none"].includes(q.vatMode)
    )
      blocking.push(
        "Confirm Dutch tax treatment with the operator’s accountant before approval.",
      );
    if (q.transportPlan !== "walking" && !(Number(q.nlVehicleRate) > 0))
      blocking.push("Enter a positive EUR transport supplier cost.");
    if (
      q.transportPlan !== "walking" &&
      Number(q.nlVehicleHours) < q.customHours &&
      q.tourDuration === "Custom"
    )
      warnings.push(
        "Custom duration exceeds entered transport hours; review overtime.",
      );
    if (q.guideIncluded !== false && !(Number(q.nlGuideRate) > 0))
      blocking.push(
        "Enter a positive EUR guide supplier cost, or select no guide.",
      );
    if (q.airportPickup || q.airportDropoff)
      warnings.push(
        "Schiphol: confirm meeting point, flight, luggage, parking and waiting charges separately.",
      );
    const walk =
      included.some((s) => s.centreWalk) && q.guideIncluded !== false;
    const guests = Number(q.adults) + Number(q.children) + Number(q.infants);
    if (walk && guests > 15)
      blocking.push(
        "City-centre guided walk exceeds 15 participants. Revise the operating plan; do not automatically split or join groups.",
      );
    if (walk && guests > 4 && !q.walkExemption)
      blocking.push(
        "City-centre guided walk above four participants: confirm the required exemption.",
      );
    if (
      walk &&
      (!q.pickupTime || q.pickupTime < "08:00" || q.pickupTime > "22:00")
    )
      blocking.push(
        "City-centre guided walk: check the permitted 08:00–22:00 operating window.",
      );
    if (q.transportPlan !== "walking" && !q.coachAccess)
      blocking.push(
        "Confirm vehicle access and permitted pickup/drop-off points. Coaches above 7.5 tonnes need an exemption for relevant centre routes, with specified exceptions.",
      );
    for (const s of included) {
      if (s.ticketRequired && s.ticketVerification !== "Client pays directly") {
        const result = tickets(s, q);
        if (result.error) blocking.push(s.name + ": " + result.error);
        if (
          (s.timedEntry && !s.entryTime) ||
          !s.availabilityConfirmed ||
          s.availabilityDate !== q.serviceDate
        )
          blocking.push(
            s.name +
              ": timed entry and service-date availability are not confirmed.",
          );
      }
      if (
        s.ticketRequired &&
        (!s.conditionsReviewed || s.conditionsReviewedDate !== q.serviceDate)
      )
        blocking.push(
          s.name +
            ": booking/cancellation/group conditions need service-date review.",
        );
      if (
        s.referenceChecked &&
        now -
          new Date(
            (s.sourceRechecked && s.operatorChecked
              ? s.operatorChecked
              : s.referenceChecked) + "T00:00:00Z",
          ) >
          30 * 86400000
      )
        blocking.push(
          s.name +
            ": public reference is older than 30 days; refresh before quoting.",
        );
      const admission = attractions.find((a) => a.id === s.attractionId);
      if (
        admission &&
        admission.closedMonthDays &&
        admission.closedMonthDays.includes(String(q.serviceDate || "").slice(5))
      )
        blocking.push(
          s.name +
            ": closed on the selected service date; choose another date or attraction.",
        );
      if (s.attractionId === "heineken") {
        const guestAges = ages(q.guestAges);
        if (
          guestAges.length !==
          Number(q.adults || 0) +
            Number(q.children || 0) +
            Number(q.infants || 0)
        )
          blocking.push(
            "Heineken Experience: enter every guest age to check 18+ admission.",
          );
        else if (guestAges.some((a) => a < 18))
          blocking.push(
            "Heineken Experience: admission is restricted to ages 18 and above, including accompanied guests.",
          );
      }
    }
    return { blocking, warnings };
  }
  function setup(template = 0) {
    const choices = [
      [
        "Amsterdam Highlights & Canal Cruise",
        ["centre-walk", "blue-boat"],
        "Half day",
      ],
      [
        "Amsterdam Museums & Culture",
        ["rijksmuseum", "rembrandt-house"],
        "Full day",
      ],
      ["Amsterdam Family Discovery", ["nemo", "artis"], "Full day"],
      [
        "Amsterdam Private / Corporate Tour",
        ["centre-walk", "adam-lookout"],
        "Half day",
      ],
    ];
    const [title, ids, duration] = choices[template];
    return {
      city: "amsterdam",
      currency: "EUR",
      tourTitle: title,
      tourDescription:
        "A privately arranged Amsterdam experience with selected visits, subject to service-date availability.",
      tourDuration: duration,
      pickupLocation: "Amsterdam hotel / agreed meeting point",
      dropoffLocation: "Amsterdam hotel / agreed meeting point",
      transportPlan: "walking",
      guideType: "Local guide",
      guideIncluded: true,
      nlVehicleRate: "",
      nlGuideRate: "",
      nlVehicleHours: 8,
      nlOvertimeRate: "",
      handlingFee: 0,
      riskBuffer: 0,
      costs: [],
      costConfirmations: {},
      vatMode: "pending",
      taxReviewed: false,
      walkExemption: false,
      coachAccess: false,
      itineraryIds: ids,
      inclusions:
        "Selected itinerary stops as stated\nGuide and transport only as explicitly confirmed\nAdmissions only where listed as included",
      cancellation:
        "Supplier-specific cancellation and amendment conditions below apply. Final availability, deadlines and payment terms require confirmation.",
    };
  }
  const api = { city, ages, tickets, checks, setup };
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root.INFRAQUOTE_DATA) root.INFRAQUOTE_DATA.cities.amsterdam = city;
  root.INFRAQUOTE_NL = api;
})(typeof window === "object" ? window : globalThis);
