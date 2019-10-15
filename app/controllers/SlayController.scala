package controllers

import javax.inject.Inject
import play.api.mvc._

import de.htwg.se.slay.Slay

@Singleton
class SlayController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  val gameController = Slay.controller
  def slayAsText = gameController.gridToString

  def about = Action {
    Ok(views.html.index())
  }

  def slay = Action {
    Ok(slayAsText)
  }

}
