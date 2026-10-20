package com.scl.portal.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val SclMaroon = Color(0xFF650007)
val SclDarkMaroon = Color(0xFF3F0004)
val SclGold = Color(0xFFF2AE00)
val SclLightGold = Color(0xFFFFD33D)
val SclSand = Color(0xFFFFF8DF)
val SclCream = Color(0xFFFAF6EE)
val SclDarkBg = Color(0xFF111827)
val SclDarkCard = Color(0xFF182234)

private val LightColorScheme = lightColorScheme(
    primary = SclMaroon,
    onPrimary = Color.White,
    primaryContainer = SclSand,
    onPrimaryContainer = SclDarkMaroon,
    secondary = SclGold,
    onSecondary = SclDarkMaroon,
    background = SclCream,
    onBackground = Color(0xFF260C0D),
    surface = Color.White,
    onSurface = Color(0xFF260C0D),
)

private val DarkColorScheme = darkColorScheme(
    primary = SclGold,
    onPrimary = SclDarkMaroon,
    primaryContainer = SclDarkMaroon,
    onPrimaryContainer = SclLightGold,
    secondary = SclGold,
    onSecondary = SclDarkMaroon,
    background = SclDarkBg,
    onBackground = Color(0xFFF8FAFC),
    surface = SclDarkCard,
    onSurface = Color(0xFFF8FAFC),
)

@Composable
fun SCLPortalTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
