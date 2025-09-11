package main

import (
    "fyne.io/fyne/v2"
    "fyne.io/fyne/v2/app"
    "fyne.io/fyne/v2/canvas"
    "fyne.io/fyne/v2/container"
    "fyne.io/fyne/v2/dialog"
    "fyne.io/fyne/v2/theme"
    "fyne.io/fyne/v2/widget"
    "image/color"
)

type pentestTheme struct{}

func (pentestTheme) Color(n theme.ColorName, v theme.ThemeVariant) color.Color {
    switch n {
    case theme.ColorNameBackground:
        return color.NRGBA{12, 12, 12, 255}
    case theme.ColorNameForeground:
        return color.NRGBA{230, 230, 230, 255}
    case theme.ColorNameButton:
        return color.NRGBA{50, 0, 0, 255}
    case theme.ColorNamePrimary:
        return color.NRGBA{220, 0, 0, 255}
    default:
        return theme.DarkTheme().Color(n, v)
    }
}
func (pentestTheme) Icon(n theme.IconName) fyne.Resource    { return theme.DarkTheme().Icon(n) }
func (pentestTheme) Font(s fyne.TextStyle) fyne.Resource   { return theme.DarkTheme().Font(s) }
func (pentestTheme) Size(n theme.SizeName) float32         { return theme.DarkTheme().Size(n) }

func main() {
    a := app.NewWithID("com.yourorg.cryptedhype")
    a.Settings().SetTheme(pentestTheme{})
    w := a.NewWindow("CryptedHype")
    w.Resize(fyne.NewSize(600, 800))

    grad := canvas.NewLinearGradient(
        color.NRGBA{200, 0, 0, 255},
        color.NRGBA{60, 0, 0, 255},
    )
    grad.SetMinSize(fyne.NewSize(600, 120))
    title := canvas.NewText("CRYPTEDHYPE", color.NRGBA{255, 50, 50, 255})
    title.TextSize = 36
    header := container.NewMax(grad, title)

    nameE := widget.NewEntry(); nameE.SetPlaceHolder("Nom")
    emailE := widget.NewEntry(); emailE.SetPlaceHolder("Email")
    passE := widget.NewPasswordEntry(); passE.SetPlaceHolder("Passphrase")
    pubArea := widget.NewMultiLineEntry(); pubArea.SetPlaceHolder("Clé publique ARMOR")
    privArea := widget.NewMultiLineEntry(); privArea.SetPlaceHolder("Clé privée ARMOR")

    genBtn := widget.NewButton("Générer PGP", func() {
        pub, priv, err := GenerateKeyPair(nameE.Text, emailE.Text, passE.Text)
        if err != nil {
            dialog.ShowError(err, w); return
        }
        pubArea.SetText(string(pub)); privArea.SetText(string(priv))
    })

    encBtn := widget.NewButton("Chiffrer un fichier", func() {
        dlg := dialog.NewFileOpen(func(r fyne.URIReadCloser, _ error) {
            if r == nil { return }
            in := r.URI().Path()
            dialog.NewFileSave(func(wr fyne.URIWriteCloser, _ error) {
                if wr == nil { return }
                out := wr.URI().Path(); wr.Close()
                if err := EncryptFile([]byte(pubArea.Text), in, out); err != nil {
                    dialog.ShowError(err, w)
                } else {
                    dialog.ShowInformation("Succès", "Chiffré → "+out, w)
                }
            }, w).SetFileName("out.pgp").Show()
        }, w)
        dlg.Show()
    })

    decBtn := widget.NewButton("Déchiffrer un fichier", func() {
        dlg := dialog.NewFileOpen(func(r fyne.URIReadCloser, _ error) {
            if r == nil { return }
            in := r.URI().Path()
            dialog.NewFileSave(func(wr fyne.URIWriteCloser, _ error) {
                if wr == nil { return }
                out := wr.URI().Path(); wr.Close()
                if err := DecryptFile([]byte(privArea.Text), passE.Text, in, out); err != nil {
                    dialog.ShowError(err, w)
                } else {
                    dialog.ShowInformation("Succès", "Déchiffré → "+out, w)
                }
            }, w).SetFileName("out").Show()
        }, w)
        dlg.Show()
    })

    content := container.NewVBox(
        header,
        widget.NewLabel("=== Génération de clés PGP ==="),
        nameE, emailE, passE, genBtn,
        pubArea, privArea,
        widget.NewSeparator(),
        widget.NewLabel("=== Chiffrement ==="), encBtn,
        widget.NewSeparator(),
        widget.NewLabel("=== Déchiffrement ==="), decBtn,
    )
    w.SetContent(content)
    w.ShowAndRun()
}
