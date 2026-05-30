[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$basePath = "c:\Users\turhv\OneDrive\שולחן העבודה\Studies\year 1\semester 2"
$renameMap = @{
    # אינפי 2
    "Lecture 1 group 1 calculus 2 2026.pdf" = "אינפי 2 הרצאה 1.pdf"
    "Lecture 2 group 1 calculus 2 2026.pdf" = "אינפי 2 הרצאה 2.pdf"
    "Exercise 1 solution.pdf" = "אינפי 2 פתרון שיעורי בית 1.pdf"
    "Exercise 2 solution.pdf" = "אינפי 2 פתרון שיעורי בית 2.pdf"
    "Recitation 1-Hebrew.pdf" = "אינפי 2 תרגול 1.pdf"
    "Recitation 2-Hebrew.pdf" = "אינפי 2 תרגול 2.pdf"

    # אלגברה לינארית 2
    "הרצאה 1 - אחרי 2.pdf" = "אלגברה לינארית 2 הרצאה 1.pdf"
    "הרצאה 2 - אחרי 2.pdf" = "אלגברה לינארית 2 הרצאה 2.pdf"
    "הרצאה 3 - אחרי 2.pdf" = "אלגברה לינארית 2 הרצאה 3.pdf"
    "הרצאה 4 - אחרי 2.pdf" = "אלגברה לינארית 2 הרצאה 4.pdf"
    "הרצאה 5 - אחרי 2.pdf" = "אלגברה לינארית 2 הרצאה 5.pdf"
    "הרצאה 6 - אחרי 2.pdf" = "אלגברה לינארית 2 הרצאה 6.pdf"
    "הרצאה 7 - אחרי 2.pdf" = "אלגברה לינארית 2 הרצאה 7.pdf"
    "הרצאה 8 - אחרי.pdf" = "אלגברה לינארית 2 הרצאה 8.pdf"
    "הרצאה 9 - אחרי 2.pdf" = "אלגברה לינארית 2 הרצאה 9.pdf"

    "Lin_Alg_II_2025-2026_Tirgul_1_Omer.pdf" = "אלגברה לינארית 2 תרגול 1.pdf"
    "Lin_Alg_II_2025-2026_Tirgul_2_Omer.pdf" = "אלגברה לינארית 2 תרגול 2.pdf"
    "Lin_Alg_II_2025-2026_Tirgul_3_Omer.pdf" = "אלגברה לינארית 2 תרגול 3.pdf"
    "Lin_Alg_II_2025-2026_Tirgul_4_Omer.pdf" = "אלגברה לינארית 2 תרגול 4.pdf"
    "Lin_Alg_II_2025-2026_Tirgul_5_Omer.pdf" = "אלגברה לינארית 2 תרגול 5.pdf"
    "Lin_Alg_II_2025-2026_Tirgul_6_Omer.pdf" = "אלגברה לינארית 2 תרגול 6.pdf"
    "Lin_Alg_II_2025-2026_Tirgul_7_Omer.pdf" = "אלגברה לינארית 2 תרגול 7.pdf"
    "Lin_Alg_II_2025-2026_Tirgul_8_Omer.pdf" = "אלגברה לינארית 2 תרגול 8.pdf"
    "Lin_Alg_II_2025-2026_Tirgul_9_Omer.pdf" = "אלגברה לינארית 2 תרגול 9.pdf"

    "Lin_Alg_II_2025-2026_Homework_1_Solutions.pdf" = "אלגברה לינארית 2 פתרון שיעורי בית 1.pdf"
    "Lin_Alg_II_2025-2026_Homework_2_Solutions.pdf" = "אלגברה לינארית 2 פתרון שיעורי בית 2.pdf"
    "Lin_Alg_II_2025-2026_Homework_2_Solutions (1).pdf" = "אלגברה לינארית 2 פתרון שיעורי בית 2 (עותק).pdf"
    "Homework 3 Solutions.pdf" = "אלגברה לינארית 2 פתרון שיעורי בית 3.pdf"
    "Homework 3 Solutions (1).pdf" = "אלגברה לינארית 2 פתרון שיעורי בית 3 (עותק).pdf"
    "Lin_Alg_II_2025-2026_Homework_4_Solutions.pdf" = "אלגברה לינארית 2 פתרון שיעורי בית 4.pdf"
    "Lin_Alg_II_2025-2026_Homework_4_Additional_Hints.pdf" = "אלגברה לינארית 2 שיעורי בית 4 רמזים נוספים.pdf"
    "Lin_Alg_II_2025-2026_Homework_5_Solutions.pdf" = "אלגברה לינארית 2 פתרון שיעורי בית 5.pdf"
    "Homework 6 Solutions.pdf" = "אלגברה לינארית 2 פתרון שיעורי בית 6.pdf"

    # לוגיקה ותורת הקבוצות
    "תרגול 01 - אחרי 1.pdf" = "לוגיקה ותורת הקבוצות תרגול 1.pdf"
    "תרגול 02 - אחרי 3.pdf" = "לוגיקה ותורת הקבוצות תרגול 2.pdf"
    "תרגול 03 - אחרי 3.pdf" = "לוגיקה ותורת הקבוצות תרגול 3.pdf"

    # מבני נתונים
    "01-Intro-DS26.pdf" = "מבני נתונים הרצאה 1 (מבוא).pdf"
    "הרצאה מבני נתונים 2.pdf" = "מבני נתונים הרצאה 2.pdf"
    "הרצאה מבני נתונים 3.pdf" = "מבני נתונים הרצאה 3.pdf"
    "מבני נתונים שעורי בית 1.pdf" = "מבני נתונים שיעורי בית 1.pdf"
    "מבני נתונים שעורי בית 1 פתרון.pdf" = "מבני נתונים פתרון שיעורי בית 1.pdf"
    "מבני נתונים שעורי בית 3.pdf" = "מבני נתונים שיעורי בית 3.pdf"
    "מבני נתונים תרגול 1.pdf" = "מבני נתונים תרגול 1.pdf"
    "מבני נתונים תרגול 3.pdf" = "מבני נתונים תרגול 3.pdf"

    # תכנות בשפת C
    "תככנות שפת c הרצאה 1.pdf" = "תכנות בשפת C הרצאה 1.pdf"
    "תככנות שפת c הרצאה 2.pdf" = "תכנות בשפת C הרצאה 2.pdf"
    "תככנות שפת c הרצאה 3.pdf" = "תכנות בשפת C הרצאה 3.pdf"
    "CS3144-HWExercises-Guidelines.pdf" = "תכנות בשפת C הנחיות הגשה.pdf"
    "SystemProg-ex1.pdf" = "תכנות בשפת C שיעורי בית 1.pdf"
    "SystemProg-ex2.pdf" = "תכנות בשפת C שיעורי בית 2.pdf"
    "SystemProg-ex3.pdf" = "תכנות בשפת C שיעורי בית 3.pdf"
    "תכנות שפת c תרגול 2.pdf" = "תכנות בשפת C תרגול 2.pdf"
    "תכנות שפת c תרגול 3.pdf" = "תכנות בשפת C תרגול 3.pdf"
    "תכנות שפת c תרגול 4.pdf" = "תכנות בשפת C תרגול 4.pdf"
    "תכנות שפת c תרגול 5.pdf" = "תכנות בשפת C תרגול 5.pdf"
    "תכנות שפת c תרגול 6.pdf" = "תכנות בשפת C תרגול 6.pdf"
    "תכנות שפת c תרגול 7.pdf" = "תכנות בשפת C תרגול 7.pdf"
    "תכנות שפת c תרגול 8.pdf" = "תכנות בשפת C תרגול 8.pdf"
    "תכנות שפת c תרגול 9.pdf" = "תכנות בשפת C תרגול 9.pdf"
    "תכנות שפת c תרגול 10.pdf" = "תכנות בשפת C תרגול 10.pdf"
    "תכנות שפת c תרגול 11.pdf" = "תכנות בשפת C תרגול 11.pdf"
}

Get-ChildItem -Path $basePath -Recurse -File | ForEach-Object {
    if ($renameMap.ContainsKey($_.Name)) {
        $newName = $renameMap[$_.Name]
        Rename-Item -Path $_.FullName -NewName $newName -Force
        Write-Output "Renamed: $($_.Name) -> $newName"
    }
}
