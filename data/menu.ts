// Menu auto-generated from PDF  (2-week cycle)
// School year: 2025-09-08 → 2026-06-12
// Total school weeks : 40
// Full 2-week cycles: 20  (+ 0 partial week(s))

export interface MealCourse {
  first: string[];
  main: string[];
}

export interface DayMenu {
  lunch: MealCourse;
  dinner: MealCourse;
  extra: string[];
}

export interface WeekMenu {
  monday: DayMenu;
  tuesday: DayMenu;
  wednesday: DayMenu;
  thursday: DayMenu;
  friday: DayMenu;
  saturday: DayMenu;
  sunday: DayMenu;
}

export interface Breakfast {
  drinks: string[];
  spreads: string[];
  breads: string[];
  staples: string[];
}

export interface Menu {
  cycleWeeks: number;
  totalSchoolWeeks: number;
  fullCycles: number;
  partialWeeks: number;
  breakfast: Breakfast;
  week1: WeekMenu;
  week2: WeekMenu;
  [key: string]: WeekMenu | number | Breakfast;
}

export const menu: Menu = {
  cycleWeeks: 2,
  totalSchoolWeeks: 40,
  fullCycles: 20,
  partialWeeks: 0,
  breakfast: {
    drinks: ["Τσάι", "Γάλα", "Χυμός"],
    spreads: ["Μαρμελάδα 2 είδη", "Μέλι", "Βούτυρο", "Μαργαρίνη", "Τυρί Edam", "Ζαμπόν"],
    breads: ["Ψωμί Λευκό-μαύρο", "Φρυγανιές"],
    staples: ["Αυγό", "Κέικ", "Corn Flakes (Δημητριακά)"],
  },
  week1: {
    monday: {
      lunch: {
        first: ["Σούπα λαχανικών"],
        main:  ["Κοτόπουλο λεμονάτο με ρύζι", "Κοτόπουλο μπιφτέκι με κριθαράκι λαχανικών"]
      },
      dinner: {
        first: ["Τυρόπιτα"],
        main:  ["Πέννες με σάλτσα ντομάτας", "Φασολάκια λαδερά με πατάτες"]
      },
      extra: ["Γλυκό"]
    },
    tuesday: {
      lunch: {
        first: ["Ψαρόσουπα"],
        main:  ["Φιλέτο ψαριού με πατάτες φούρνου", "Θαλασσινά με κριθαράκι"]
      },
      dinner: {
        first: ["Λαχανόρυζο"],
        main:  ["Κοκκινιστό μοσχάρι με ριζότο λαχανικών", "Λουκάνικα χωριάτικα με πουρέ πατάτας"]
      },
      extra: ["Φρούτο"]
    },
    wednesday: {
      lunch: {
        first: ["Τουρσί με ελιές και ταραμοσαλάτα"],
        main:  ["Φακές σούπα", "Φασόλια φούρνου"]
      },
      dinner: {
        first: ["Ριζότο μανιταριών"],
        main:  ["Μπιφτέκι φούρνου με κουσκούς", "Γιουβαρλάκια σούπα"]
      },
      extra: ["Γλυκό"]
    },
    thursday: {
      lunch: {
        first: ["Μανιταρόσουπα"],
        main:  ["Κοπανάκια κοτόπουλο γιουβέτσι", "Κοτόπουλο σνίτσελ με ρύζι"]
      },
      dinner: {
        first: ["Λαχανικά βραστά βουτύρου"],
        main:  ["Χοιρινό λεμονάτο με πουρέ πατάτας", "Χοιρινά σουβλάκια με πατάτες φούρνου"]
      },
      extra: ["Φρούτο"]
    },
    friday: {
      lunch: {
        first: ["Μινεστρόνε"],
        main:  ["Αρακάς λαδερός", "Βίδες με σάλτσα λαχανικών"]
      },
      dinner: {
        first: ["Ριζότο λαχανικών"],
        main:  ["Βακαλάος πανέ με ρύζι", "Χταπόδι και θαλασσινά κοκκινιστά με μακαρονάκ κοφτό"]
      },
      extra: ["Γλυκό"]
    },
    saturday: {
      lunch: {
        first: ["Κρεατόσουπα"],
        main:  ["Αρνάκι λεμονάτο με πατάτες φούρνου", "Χοιρινή τηγανιά με ριζότο λαχανικών"]
      },
      dinner: {
        first: ["Σπανακόρυζο"],
        main:  ["Κοτόπουλο φούρνου με ρύζι", "Μπουκιές κοτόπουλο ι παναρισμένες με πουρέ πατάτας"]
      },
      extra: ["Φρούτο"]
    },
    sunday: {
      lunch: {
        first: ["Χορτόσουπα"],
        main:  ["Σουτζουκάκια κοκκινιστά με κριθαράκι", "Σάλτσα κιμά με ζυμαρικά"]
      },
      dinner: {
        first: ["Σπανακόπιτα"],
        main:  ["Ομελέτα με πατάτες και τυριά", "Φασολάδα"]
      },
      extra: ["Γλυκό"]
    },
  },
  week2: {
    monday: {
      lunch: {
        first: ["Κρεατόσουπα"],
        main:  ["Μοσχαράκι κοκκινιστό με κριθαράκι", "Χοιρινές πανσέτες με πουρέ πατάτας"]
      },
      dinner: {
        first: ["Μανιταρόσουπα"],
        main:  ["Ζυμαρικά με λευκή σάλτσα μανιταριών", "Σπανακόρυζο"]
      },
      extra: ["Γλυκό"]
    },
    tuesday: {
      lunch: {
        first: ["Κοτόσουπα"],
        main:  ["Κοτόπουλο με σάλτσα μουστάρδας και πατάτες φούρνου", "Κοπανάκια κοτόπουλο με σάλτσα BBQ και ρύζι"]
      },
      dinner: {
        first: ["Τυρόπιτα"],
        main:  ["Κεφτεδάκια κοκκινιστά με ριζότο λαχανικών", "Πέννες με σάλτσα κιμά"]
      },
      extra: ["Φρούτο"]
    },
    wednesday: {
      lunch: {
        first: ["Σούπα Λαχανικών"],
        main:  ["Φασόλια σούπα", "Φακόρυζο"]
      },
      dinner: {
        first: ["Ντοματόσουπα"],
        main:  ["Χοιρινό ψητό με σάλτσα λεμονιού και κουσκούς", "Λουκάνικα χωριάτικα με λαχανικά και κόκκινη σάλτσα (Σπετσοφάι)"]
      },
      extra: ["Γλυκό"]
    },
    thursday: {
      lunch: {
        first: ["Ψαρόσουπα"],
        main:  ["Ψάρι φιλέτο με βραστά λαχανικά", "Ριζότο με σάλτσα θαλασσινών"]
      },
      dinner: {
        first: ["Τραχανάς"],
        main:  ["Κοτόπουλο ψητό με κριθαράκι λαχανικών", "Μπιφτέκι κοτόπουλο με πουρέ πατάτας"]
      },
      extra: ["Φρούτο"]
    },
    friday: {
      lunch: {
        first: ["Σούπα Μινεστρόνε"],
        main:  ["Πρασσόρυζο", "Σουφλέ ζυμαρικών με τυριά"]
      },
      dinner: {
        first: ["Χορτόσουπα"],
        main:  ["Ρεβίθια σούπα", "Ομελέτα φούρνου με τυριά"]
      },
      extra: ["Γλυκό"]
    },
    saturday: {
      lunch: {
        first: ["Λαχανόρυζο"],
        main:  ["Ψάρι φιλέτο λεμονάτο με ριζότο λαχανικών", "Γιουβέτσι θαλασσινών"]
      },
      dinner: {
        first: ["Κριθαρότο λαχανικών"],
        main:  ["Κοτόπουλο μπιφτέκι με πατάτες φούρνου", "Κοτόπουλο παναρισμένο με ρύζι"]
      },
      extra: ["Φρούτο"]
    },
    sunday: {
      lunch: {
        first: ["Κοτόσουπα"],
        main:  ["Αρνάκι φούρνου με ρύζι", "Χοιρινά σουβλάκια με πατάτες φούρνου"]
      },
      dinner: {
        first: ["Λαχανικά βραστά βουτύρου"],
        main:  ["Μπιφτέκι φούρνου με πουρέ πατάτας", "Παστίτσιο"]
      },
      extra: ["Γλυκό"]
    },
  },
};