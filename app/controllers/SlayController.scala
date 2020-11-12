package controllers

import javax.inject._
import play.api.mvc._

import de.htwg.se.slay.Slay

@Singleton
class SlayController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  val gameController = Slay.controller

  def slayAsText = {
    views.html.slay("player1", "Player2", this)
  }

  def about = Action {
    Ok(views.html.about())
  }

  def slay = Action {
    Ok(slayAsText)
  }

  //commands
  def buy(coord: String) = Action {
    Slay.tui.processInput("buy " + coord)
    Ok(slayAsText)
  }

  def mov(coord1: String, coord2: String) = Action{
    Slay.tui.processInput("mov " + coord1 + " " + coord2)
    Ok(slayAsText)
  }

  def cmb(coord1: String, coord2: String) = Action{
    Slay.tui.processInput("cmb " + coord1 + " " + coord2)
    Ok(slayAsText)
  }

  def plc(coord: String) = Action {
    Slay.tui.processInput("plc " + coord)
    Ok(slayAsText)
  }

  def undo() = Action {
    Slay.tui.processInput("undo")
    Ok(slayAsText)
  }

  def redo() = Action {
    Slay.tui.processInput("redo")
    Ok(slayAsText)
  }

  def end() = Action {
    Slay.tui.processInput("end")
    Ok(slayAsText)
  }

  def surrender() = Action {
    Slay.tui.processInput("ff20")
    Ok(slayAsText)
  }
}


