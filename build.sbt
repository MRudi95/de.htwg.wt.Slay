name := "de.htwg.wt.Slay-master"

version := "0.1"

lazy val root = (project in file(".")).enablePlugins(PlayScala).enablePlugins(SbtWeb)

includeFilter in (Assets, LessKeys.less) := "*.less"

resolvers += Resolver.sonatypeRepo("snapshots")

scalaVersion := "2.12.8"

libraryDependencies += guice

libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.4" % "test"

libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % Test

libraryDependencies += "com.h2database" % "h2" % "1.4.196"

libraryDependencies += "org.webjars" % "bootstrap" % "3.3.4"
